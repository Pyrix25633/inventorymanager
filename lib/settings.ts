export const settings = {
    https: {
        cert: "certs/cert.pem",
        key: "certs/key.pem",
        passphrase: "",
        suppressRejectUnauthorized: true,
        hostname: "",
        port: 4443,
        upgradePort: 8080
    },
    jwt: {
        cookieName: "inventorymanager-auth",
        password: "",
        algorithm: "HS512"
    },
    bcrypt: {
        rounds: 12
    },
    tfa: {
        algorithm: 'SHA512',
        window: 2
    },
    nodemailerTransport: {
        host: "smtp.zoho.eu",
        port: 465,
        secure: true,
        auth: {
            user: "simplychat@zohomail.eu",
            pass: ""
        }
    },
    database: {
        pageSize: 10
    },
    production: false
};