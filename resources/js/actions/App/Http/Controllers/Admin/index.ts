import AIController from './AIController'
import CorporationController from './CorporationController'
import FrameworkController from './FrameworkController'
import ControlController from './ControlController'
import UserController from './UserController'

const Admin = {
    AIController: Object.assign(AIController, AIController),
    CorporationController: Object.assign(CorporationController, CorporationController),
    FrameworkController: Object.assign(FrameworkController, FrameworkController),
    ControlController: Object.assign(ControlController, ControlController),
    UserController: Object.assign(UserController, UserController),
}

export default Admin