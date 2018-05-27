var File = require('ucipass-file')
var forge = require('node-forge');
forge.options.usePureJavaScript = true;

var options = {
    certFilename:       'newcert.crt',
    keyFilename:        'newcert.key',
    commonName:         'home.local',
    countryName:        'US',
    shortName:          'Illinois',
    name:               'Cook',
    localityName:       'Chicago',
    organizationName:   'IT',
    OU:                 'IT',
    subjectAltName:     'http://home.local',
    subjectAltIP:       '127.0.0.1'
}

module.exports = async function (opt){

    if(opt){
        if (opt.certFilename)   options.certFilename=opt.certFilename
        if (opt.keyFilename)    options.keyFilename=opt.keyFilename
        if (opt.commonName)     options.commonName=opt.commonName
        if (opt.countryName)    options.countryName=opt.countryName
        if (opt.shortName)      options.shortName=opt.shortName
        if (opt.name)           options.name=opt.name
        if (opt.localityName)   options.localityName=opt.localityName
        if (opt.organizationName) options.organizationName=opt.organizationName
        if (opt.OU)             options.OU=opt.OU
        if (opt.subjectAltName) options.subjectAltName=opt.subjectAltName
        if (opt.subjectAltIP)   options.subjectAltIP=opt.subjectAltIP
    }

    var pki = forge.pki;
    // generate a keypair or use one you have already
    var keys = pki.rsa.generateKeyPair(2048);
    // create a new certificate
    var cert = pki.createCertificate();
    // fill the required fields
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    // use options attributes here
    var attrs = [{
        name: 'commonName',
        value: options.commonName
        },
        {
        name: 'countryName',
        value: options.countryName
        },
        {
        shortName: 'ST',
        value: options.countryName
        },
        {
        name: 'localityName',
        value: options.localityName
        },
        {
        name: 'organizationName',
        value: options.organizationName
        },
        {
        shortName: 'OU',
        value: options.OU
        }];

    // here we set subject and issuer as the same one
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    cert.setExtensions(
        [{
            name: 'basicConstraints',
            cA: true
        }, 
        {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true
        },
        {
            name: 'nsCertType',
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true
        },
        {
        name: 'subjectAltName',
        altNames: [{
            type: 6, // URI
            value: options.subjectAltName
            },
            {
            type: 7, // IP
            ip: options.subjectAltIP
            }]
        },
        {
        name: 'subjectKeyIdentifier'
        }]);
    
    // the actual certificate signing
    cert.sign(keys.privateKey);
    // now convert the Forge certificate to PEM format
    var crt = pki.certificateToPem(cert);
    var key = pki.privateKeyToPem(keys.privateKey)
    //console.log(crt);
    //console.log(key);
    let fcrt = new File(options.certFilename)
    await fcrt.writeString(crt)
    let fkey = new File(options.keyFilename)
    await fkey.writeString(key)
    return true
}
