async function deriveKey(password, salt, iterations, hashAlg, length) {
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: new TextEncoder().encode(salt),
            iterations: iterations,
            hash: hashAlg,
        },
        baseKey,
        { name: "HMAC", hash: hashAlg, length: length },
        true,
        ["sign", "verify"]
    );

    const exportedKey = await window.crypto.subtle.exportKey("raw", derivedKey);
    return new Uint8Array(exportedKey);
}

async function generateWallet(password, userId) {
    // Key derivation parameters
    const iterations = 100000;

    // Derive a key from the password using the user ID as salt
    const derivedBytes = await deriveKey(password, userId, iterations, 'SHA-512', 256);
    const privateKey = '0x' + ethers.utils.hexlify(derivedBytes).slice(2, 66);
    
    // Use the derived key as the wallet's private key
    const wallet = new ethers.Wallet(privateKey);
    return wallet;
}