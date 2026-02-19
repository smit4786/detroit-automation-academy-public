# API Documentation

This document provides detailed API documentation for all classes, functions, and modules in the Detroit Automation Academy codebase.

## Module: detroit_automation_academy

Main module containing project description and overview.

**Docstring:** Comprehensive project description including opportunity, solution, program overview, and key outcomes.

---

## Module: phase1.led_blink

### blink_led(pin, duration=1.0, times=5)

Blink an LED connected to the specified GPIO pin.

**Parameters:**
- `pin` (int): GPIO pin number where LED is connected
- `duration` (float): Duration of each blink in seconds (default: 1.0)
- `times` (int): Number of times to blink the LED (default: 5)

**Returns:** None

**Example:**
```python
blink_led(17, 0.5, 10)  # Blink LED on pin 17 for 0.5s, 10 times
```

---

## Module: phase1.button_press

### button_pressed(pin)

Callback function executed when a button press is detected.

**Parameters:**
- `pin` (int): GPIO pin number where button is connected

**Returns:** None

**Notes:** This function is automatically called by GPIO event detection when a falling edge is detected on the specified pin. This demonstrates event-driven programming, which is more efficient than polling in a loop.

**Example:**
```python
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
BUTTON_PIN = 18
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def button_pressed(pin):
    print("Button pressed on pin", pin)

GPIO.add_event_detect(BUTTON_PIN, GPIO.FALLING, callback=button_pressed, bouncetime=200)
# Bouncetime=200ms prevents multiple triggers from mechanical bounce
```

**Common Patterns:**
- **Pull-up resistor:** Keeps pin HIGH by default; button press pulls it LOW (falling edge)
- **Bouncetime:** Debounce delay (milliseconds) to ignore multiple rapid triggers from button bounce
- **Edge detection:** `GPIO.FALLING` (press), `GPIO.RISING` (release), `GPIO.BOTH` (either)

---

## Module: phase2.cad_design

This module provides tools for generating parametric 3D models in STL format for 3D printing and G-code for laser cutting.

### Class: STLWriter

Writes 3D model data to STL (STereoLithography) binary format for 3D printing.

#### Constructor: STLWriter(filename)

**Parameters:**
- `filename` (str): Output file path (e.g., `'rover_chassis.stl'`)

#### Methods:

##### add_triangle(v1, v2, v3, normal=None)

Add a triangular face to the 3D model.

**Parameters:**
- `v1, v2, v3` (tuple): Vertex coordinates as (x, y, z) tuples
- `normal` (tuple, optional): Surface normal vector; auto-calculated if None

**Returns:** None

**Example:**
```python
stl = STLWriter('my_model.stl')
stl.add_triangle((0, 0, 0), (1, 0, 0), (0.5, 1, 0))
stl.write()
```

##### write()

Serialize all triangles to binary STL file.

**Returns:** None

**Output:** Binary file with 80-byte header, triangle count, and triangle data

---

### Function: add_cuboid(stl, x, y, z, dx, dy, dz)

Helper function to add a rectangular box to an STL writer.

**Parameters:**
- `stl` (STLWriter): The STL writer instance
- `x, y, z` (float): Origin coordinates (bottom-front-left corner)
- `dx, dy, dz` (float): Box dimensions in x, y, z directions

**Returns:** None

**Example:**
```python
stl = STLWriter('box.stl')
add_cuboid(stl, 0, 0, 0, 10, 5, 3)  # 10×5×3 box at origin
stl.write()
```

---

### Function: create_rover_chassis(width=10, height=5, length=15)

Generate a simple rover chassis (rectangular body).

**Parameters:**
- `width` (float): Width of chassis (default: 10mm)
- `height` (float): Height of chassis (default: 5mm)
- `length` (float): Length of chassis (default: 15mm)

**Returns:** None

**Output:** Generates `rover_chassis.stl` file in current directory

**Learning Point:** Demonstrates how parametric inputs control model dimensions; changing parameters generates different part sizes without re-coding geometry.

---

### Function: create_sensor_mount(radius=2, height=3)

Generate a cylindrical sensor mount (e.g., for ultrasonic sensors).

**Parameters:**
- `radius` (float): Cylinder radius (default: 2mm)
- `height` (float): Cylinder height (default: 3mm)

**Returns:** None

**Output:** Generates `sensor_mount.stl` file in current directory

**Learning Point:** Demonstrates circular geometry and how to generate parts for real rover hardware integration.

---

### G-Code Generation Pattern

Phase 2 teaches parametric CAD, but students also generate G-code for laser cutting. The workflow:

1. **Python generates geometry:** Functions like `laser_cut_circle()` produce X, Y, Z coordinates
2. **Convert to G-code:** Linearize paths and add laser control commands (M3 for on, M5 for off)
3. **Output file:** Save as `.gcode` for Epilog Fusion Maker or other laser cutters

**Example G-code structure:**
```
G21          ; Set units to millimeters
G90          ; Absolute positioning
M3 S255      ; Laser on at full power
G0 Z5        ; Move to safe height
G0 X0 Y0     ; Move to start position
G1 Z-1 F100  ; Lower to cutting depth
G1 X10 F200  ; Cut line to (10, 0)
G0 Z5        ; Raise to safe height
M5           ; Laser off
M30          ; End program
```

**Curriculum Link:** See [../activations/README.md](../activations/README.md) for material-specific power/speed parameters and design recommendations.

---

## Module: phase3.autonomous_rover

### Class: Rover

Represents an autonomous rover with position and orientation in a 2D grid world.

#### Constructor: Rover(x=0, y=0)

**Parameters:**
- `x` (int): Initial x-coordinate (default: 0)
- `y` (int): Initial y-coordinate (default: 0)

#### Methods:

##### move_forward()

Move the rover one unit forward in its current direction.

**Returns:** None

##### turn_left()

Rotate the rover 90 degrees counterclockwise.

**Returns:** None

##### turn_right()

Rotate the rover 90 degrees clockwise.

**Returns:** None

##### get_position()

Get the current position of the rover.

**Returns:** tuple (x, y) - Current coordinates

---

### Class: World

Represents a 2D grid world with obstacles and boundaries.

#### Constructor: World(width=10, height=10)

**Parameters:**
- `width` (int): Width of the world grid (default: 10)
- `height` (int): Height of the world grid (default: 10)

#### Methods:

##### is_valid_position(x, y)

Check if a given position is valid (within bounds and not on obstacle).

**Parameters:**
- `x` (int): X-coordinate to check
- `y` (int): Y-coordinate to check

**Returns:** bool - True if position is valid, False otherwise

##### display(rover)

Display the world as an ASCII grid with rover and obstacles.

**Parameters:**
- `rover` (Rover): The rover object to display

**Returns:** None

**Output:** ASCII grid where:
- 'R' = rover position
- '#' = obstacle
- '.' = empty space

---

### Function: simple_autonomous_navigation(rover, world, steps=20)

Simulate simple autonomous navigation behavior.

**Parameters:**
- `rover` (Rover): The rover object to control
- `world` (World): The world object containing obstacles
- `steps` (int): Number of simulation steps (default: 20)

**Returns:** None

**Behavior:** Attempts to move forward, turns randomly if blocked by obstacles or boundaries.

---

## Module: test_examples

### test_rover_initialization()

Test rover initialization with default and custom positions.

**Returns:** None

### test_rover_movement()

Test rover movement and rotation functionality.

**Returns:** None

### test_world_bounds()

Test world boundary and obstacle checking.

**Returns:** None

---

## Dependencies

### Core Dependencies
- Python 3.8+
- RPi.GPIO (for Raspberry Pi GPIO control)
- numpy (for numerical computations)
- matplotlib (for data visualization)
- pandas (for data manipulation)
- opencv-python (for computer vision)
- dronekit (for drone control)

### Development Dependencies
- pytest (for testing)
- black (for code formatting)
- flake8 (for linting)

### Hardware Dependencies
- Raspberry Pi 4+ (for Phase 1 examples)
- GPIO-connected LEDs and buttons
- Optional: Sensors, motors, cameras

---

## Error Handling

All GPIO operations should be wrapped in try-except blocks:

```python
try:
    # GPIO operations
    pass
except KeyboardInterrupt:
    print("Interrupted by user")
finally:
    GPIO.cleanup()  # Always clean up GPIO
```

Common exceptions:
- `RuntimeError`: GPIO access denied (run with sudo)
- `ValueError`: Invalid pin number or mode
- `TypeError`: Incorrect parameter types

---

## Constants

### GPIO Pin Modes
- `GPIO.BCM`: Broadcom pin numbering
- `GPIO.BOARD`: Physical pin numbering

### GPIO States
- `GPIO.HIGH`: Logic high (3.3V)
- `GPIO.LOW`: Logic low (0V)

### GPIO Directions
- `GPIO.OUT`: Output pin
- `GPIO.IN`: Input pin

### Pull Resistor States
- `GPIO.PUD_UP`: Enable internal pull-up resistor
- `GPIO.PUD_DOWN`: Enable internal pull-down resistor

---

## Performance Considerations

- GPIO operations are relatively slow; avoid tight loops
- Use event detection for button inputs instead of polling
- Clean up GPIO resources properly to avoid conflicts
- Consider using PWM for smooth LED brightness control

---

## Security Notes

- GPIO access requires root privileges on Raspberry Pi
- Always validate input parameters to prevent hardware damage
- Use appropriate current-limiting resistors for LEDs
- Implement proper error handling for sensor failures