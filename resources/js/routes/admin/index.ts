import corporations from './corporations'
import frameworks from './frameworks'
import controls from './controls'
import users from './users'

const admin = {
    corporations: Object.assign(corporations, corporations),
    frameworks: Object.assign(frameworks, frameworks),
    controls: Object.assign(controls, controls),
    users: Object.assign(users, users),
}

export default admin