import * as THREE from 'three';

export class Raycaster {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.interactiveObjects = [];
        this.hoveredObject = null;
        this.isDragging = false;
        this.dragStartPosition = new THREE.Vector2();

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.domElement.addEventListener('click', this.onClick.bind(this));
    }

    onMouseMove(event) {
        // Update mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

        if (intersects.length > 0) {
            const newHovered = intersects[0].object;
            
            if (this.hoveredObject !== newHovered) {
                // Unhover previous
                if (this.hoveredObject) {
                    this.emit('unhover', this.hoveredObject);
                }
                
                // Hover new
                this.hoveredObject = newHovered;
                this.emit('hover', this.hoveredObject);
                document.body.classList.add('can-interact');
            }
        } else {
            // No intersection
            if (this.hoveredObject) {
                this.emit('unhover', this.hoveredObject);
                this.hoveredObject = null;
                document.body.classList.remove('can-interact');
            }
        }

        // Emit drag event if dragging
        if (this.isDragging) {
            const dragDelta = {
                x: this.mouse.x - this.dragStartPosition.x,
                y: this.mouse.y - this.dragStartPosition.y
            };
            this.emit('drag', { object: this.hoveredObject, delta: dragDelta, mouse: this.mouse });
        }
    }

    onMouseDown(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

        if (intersects.length > 0) {
            this.isDragging = true;
            this.dragStartPosition.copy(this.mouse);
            document.body.classList.add('dragging');
            this.emit('dragStart', intersects[0].object);
        }
    }

    onMouseUp(event) {
        if (this.isDragging) {
            this.isDragging = false;
            document.body.classList.remove('dragging');
            
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
            
            if (intersects.length > 0) {
                this.emit('dragEnd', intersects[0].object);
            }
        }
    }

    onClick(event) {
        // Only trigger click if not dragging
        if (this.isDragging) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

        if (intersects.length > 0) {
            this.emit('click', intersects[0].object);
        }
    }

    addInteractiveObject(object) {
        if (!this.interactiveObjects.includes(object)) {
            this.interactiveObjects.push(object);
        }
    }

    removeInteractiveObject(object) {
        const index = this.interactiveObjects.indexOf(object);
        if (index > -1) {
            this.interactiveObjects.splice(index, 1);
        }
    }

    clearInteractiveObjects() {
        this.interactiveObjects = [];
        this.hoveredObject = null;
    }

    // Event emitter
    listeners = {};

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}
