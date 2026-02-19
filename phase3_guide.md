# Phase 3: Autonomous Systems & Sensor Fusion

This phase covers advanced robotics concepts including autonomous navigation, sensor fusion, and computer vision.

## Learning Objectives

By the end of Phase 3, students will be able to:
- Implement basic autonomous navigation algorithms
- Combine data from multiple sensors
- Apply computer vision techniques
- Design and build autonomous robotic systems
- Debug complex robotic systems

## Autonomous Rover Simulation

The `autonomous_rover.py` script provides a software simulation of autonomous rover behavior.

### Classes

#### Rover Class

Represents the autonomous rover with position and orientation.

**Attributes:**
- `x, y`: Current position coordinates
- `direction`: Facing direction (0: North, 1: East, 2: South, 3: West)

**Methods:**
- `move_forward()`: Move one unit in current direction
- `turn_left()`: Rotate 90° counterclockwise
- `turn_right()`: Rotate 90° clockwise
- `get_position()`: Return current (x, y) position

#### World Class

Represents the environment with obstacles and boundaries.

**Attributes:**
- `width, height`: World dimensions
- `obstacles`: Set of (x, y) coordinates with obstacles

**Methods:**
- `is_valid_position(x, y)`: Check if position is within bounds and obstacle-free
- `display(rover)`: Print ASCII representation of world with rover

### Algorithm: Simple Autonomous Navigation

The current implementation uses a basic reactive navigation strategy:

1. Attempt to move forward
2. If movement blocked (obstacle or boundary):
   - Return to original position
   - Randomly turn left or right
3. Repeat for specified number of steps

**Limitations:**
- No path planning or goal-directed behavior
- Random turning may not be efficient
- No sensor simulation

### Extensions

#### Adding Sensors

```python
class SensorRover(Rover):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.sensors = {
            'front': False,
            'left': False,
            'right': False
        }

    def update_sensors(self, world):
        # Check for obstacles in each direction
        directions = [(0, 1), (-1, 0), (1, 0)]  # front, left, right
        for i, (dx, dy) in enumerate(directions):
            # Rotate direction based on current orientation
            # Check if next position is valid
            pass
```

#### Path Planning

Implement A* algorithm for goal-directed navigation:

```python
import heapq

def astar_pathfinding(world, start, goal):
    # Priority queue for open nodes
    open_set = []
    heapq.heappush(open_set, (0, start))

    # Cost from start to current node
    g_score = {start: 0}

    # Estimated total cost from start to goal through current node
    f_score = {start: heuristic(start, goal)}

    # Reconstruct path
    came_from = {}

    while open_set:
        current = heapq.heappop(open_set)[1]

        if current == goal:
            return reconstruct_path(came_from, current)

        # Check neighbors
        for neighbor in get_neighbors(current, world):
            tentative_g_score = g_score[current] + 1

            if tentative_g_score < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None  # No path found
```

## Sensor Fusion Concepts

### Multiple Sensor Integration

Real autonomous systems combine data from multiple sensors:

1. **Proprioceptive Sensors**: Measure internal state (encoders, IMUs)
2. **Exteroceptive Sensors**: Measure external environment (cameras, LIDAR, ultrasonic)
3. **Active Sensors**: Emit signals and measure response (sonar, radar)
4. **Passive Sensors**: Measure ambient signals (cameras, microphones)

### Kalman Filtering

For combining noisy sensor measurements:

```python
class KalmanFilter:
    def __init__(self, initial_state, initial_uncertainty):
        self.state = initial_state
        self.uncertainty = initial_uncertainty

    def predict(self, motion_model, motion_noise):
        # Prediction step
        self.state = motion_model(self.state)
        self.uncertainty = motion_model(self.uncertainty) + motion_noise

    def update(self, measurement, measurement_model, measurement_noise):
        # Update step
        innovation = measurement - measurement_model(self.state)
        innovation_uncertainty = measurement_model(self.uncertainty) + measurement_noise

        kalman_gain = self.uncertainty @ measurement_model.T @ np.linalg.inv(innovation_uncertainty)

        self.state = self.state + kalman_gain @ innovation
        self.uncertainty = (np.eye(len(self.state)) - kalman_gain @ measurement_model) @ self.uncertainty
```

## Computer Vision

### OpenCV Integration

Basic object detection:

```python
import cv2

def detect_objects(frame):
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Edge detection
    edges = cv2.Canny(blurred, 50, 150)

    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter contours by area
    min_area = 100
    objects = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]

    return objects
```

## Capstone Project Ideas

1. **Autonomous Maze Solver**
   - Navigate through a physical maze
   - Use sensors to detect walls
   - Implement path memorization

2. **Line Following Robot**
   - Follow a line on the floor
   - Adjust speed based on line curvature
   - Handle intersections and obstacles

3. **Object Tracking Drone**
   - Use camera to track colored objects
   - Maintain safe distance
   - Return to start position

4. **Smart Home Assistant**
   - Voice control with microphone
   - Environmental monitoring
   - Automated responses to conditions

## Hardware Considerations

### Motor Control
- Use H-bridge circuits for bidirectional control
- PWM for speed control
- Encoder feedback for position sensing

### Power Management
- Battery voltage monitoring
- Power-efficient sleep modes
- Solar charging capabilities

### Communication
- Bluetooth/WiFi for remote control
- Serial communication with sensors
- Data logging for analysis

## Testing and Validation

### Simulation Testing
- Test algorithms in software before hardware
- Use realistic sensor noise models
- Validate edge cases

### Hardware Testing
- Start with individual components
- Gradually integrate subsystems
- Field testing in controlled environments

### Performance Metrics
- Navigation accuracy
- Power consumption
- Response time
- Reliability under various conditions

## Resources

- [ROS (Robot Operating System)](https://www.ros.org/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Kalman Filter Tutorial](https://www.kalmanfilter.net/)
- [Autonomous Navigation Papers](https://arxiv.org/)