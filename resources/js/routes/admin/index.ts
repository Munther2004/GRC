import corporations from './corporations'
import frameworks from './frameworks'
import controls from './controls'
import users from './users'
import invites from './invites'
import evidence from './evidence'
import securityAudits from './security-audits'
const admin = {
    corporations: Object.assign(corporations, corporations),
frameworks: Object.assign(frameworks, frameworks),
controls: Object.assign(controls, controls),
users: Object.assign(users, users),
invites: Object.assign(invites, invites),
evidence: Object.assign(evidence, evidence),
securityAudits: Object.assign(securityAudits, securityAudits),
}

export default admin