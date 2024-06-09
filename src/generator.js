import crypto from 'crypto';
function generateInvite(){
    const code = crypto.randomUUID()
    return {
        invite: code,
        hash: crypto.createHash('sha256').update(code).digest('hex')
    }
}

console.log(generateInvite())
