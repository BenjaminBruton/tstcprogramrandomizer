import * as CANNON from 'cannon-es';
import { PHYSICS_CONFIG } from '../constants.js';

export class PhysicsWorld {
    constructor() {
        this.world = null;
        this.bodies = [];
        this.meshes = [];
        this.init();
    }

    init() {
        // Create Cannon.js World
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, PHYSICS_CONFIG.GRAVITY, 0)
        });

        // Set solver parameters for better performance
        this.world.solver.iterations = 10;
        this.world.allowSleep = true;

        // Create ground physics body
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, // Static
            shape: groundShape
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);
    }

    addBody(body, mesh = null) {
        this.world.addBody(body);
        if (mesh) {
            this.bodies.push(body);
            this.meshes.push(mesh);
        }
        return body;
    }

    removeBody(body) {
        this.world.removeBody(body);
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
            this.meshes.splice(index, 1);
        }
    }

    update() {
        // Step the physics world
        this.world.step(PHYSICS_CONFIG.TIME_STEP);

        // Sync Three.js meshes with physics bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const mesh = this.meshes[i];

            if (mesh && body) {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        }
    }

    createBoxBody(size, mass = 1, position = { x: 0, y: 0, z: 0 }) {
        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        const body = new CANNON.Body({
            mass: mass,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        return body;
    }

    createSphereBody(radius, mass = 1, position = { x: 0, y: 0, z: 0 }) {
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: mass,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        return body;
    }

    createCylinderBody(radiusTop, radiusBottom, height, mass = 1, position = { x: 0, y: 0, z: 0 }) {
        const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 8);
        const body = new CANNON.Body({
            mass: mass,
            shape: shape,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        return body;
    }

    clearDynamicBodies() {
        // Remove all dynamic bodies (keep static ones like ground)
        const bodiesToRemove = this.bodies.slice();
        bodiesToRemove.forEach(body => {
            if (body.mass > 0) {
                this.removeBody(body);
            }
        });
    }

    getWorld() {
        return this.world;
    }
}
