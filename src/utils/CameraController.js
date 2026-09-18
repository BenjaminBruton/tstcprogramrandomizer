import gsap from 'gsap';
import { CAMERA_POSITIONS, CAMERA_TARGETS } from '../constants.js';

export class CameraController {
    constructor(camera, controls = null) {
        this.camera = camera;
        this.controls = controls;
        this.isAnimating = false;
    }

    moveTo(phase, duration = 0.0001, onComplete = null) {  // Instant!
        if (this.isAnimating) {
            console.warn('⚠️ Camera already animating, skipping...');
            return;
        }

        const targetPos = CAMERA_POSITIONS[phase];
        const targetLookAt = CAMERA_TARGETS[phase];

        if (!targetPos || !targetLookAt) {
            console.warn(`No camera position defined for phase: ${phase}`);
            return;
        }

        console.log(`📹 Camera INSTANTLY jumping to ${phase}...`);
        
        // Just snap camera immediately
        this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
        this.camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);
        
        console.log('✅ Camera moved instantly!');
        
        // Call completion immediately
        if (onComplete) {
            setTimeout(() => onComplete(), 10);
        }
        
        return;

        // Create a dummy target for lookAt animation
        const currentTarget = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };

        const lookAtTarget = {
            x: targetLookAt.x,
            y: targetLookAt.y,
            z: targetLookAt.z
        };

        // Animate camera position AND lookAt together
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false;
                
                // Re-enable OrbitControls after transition
                if (this.controls) {
                    console.log('🔓 Re-enabling OrbitControls');
                    this.controls.enabled = true;
                    // Update controls target
                    this.controls.target.set(targetLookAt.x, targetLookAt.y, targetLookAt.z);
                    this.controls.update();
                }
                
                console.log('✅ Camera transition complete!');
                console.log('   Final camera pos:', this.camera.position);
                if (onComplete) {
                    console.log('🎬 Running callback...');
                    onComplete();
                }
            }
        });

        // Animate camera position
        timeline.to(this.camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: duration,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
            }
        }, 0);

        // Animate lookAt target simultaneously
        timeline.to(lookAtTarget, {
            x: targetLookAt.x,
            y: targetLookAt.y,
            z: targetLookAt.z,
            duration: duration,
            ease: 'power2.inOut'
        }, 0);
    }

    shake(intensity = 0.5, duration = 0.5) {
        const originalPosition = {
            x: this.camera.position.x,
            y: this.camera.position.y,
            z: this.camera.position.z
        };

        const timeline = gsap.timeline();

        // Create shake effect
        for (let i = 0; i < 10; i++) {
            timeline.to(this.camera.position, {
                x: originalPosition.x + (Math.random() - 0.5) * intensity,
                y: originalPosition.y + (Math.random() - 0.5) * intensity,
                z: originalPosition.z + (Math.random() - 0.5) * intensity,
                duration: duration / 10,
                ease: 'power1.inOut'
            });
        }

        // Return to original position
        timeline.to(this.camera.position, {
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z,
            duration: duration / 10,
            ease: 'power1.out'
        });
    }

    zoom(targetDistance, duration = 1, onComplete = null) {
        const direction = this.camera.position.clone().normalize();
        const targetPosition = direction.multiplyScalar(targetDistance);

        gsap.to(this.camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: duration,
            ease: 'power2.inOut',
            onComplete: onComplete
        });
    }

    getIsAnimating() {
        return this.isAnimating;
    }
}
