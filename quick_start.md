# Quick Start Guide

Welcome to the Detroit Automation Academy! This guide will help you get started with the codebase and examples.

## Prerequisites

Before you begin, ensure you have:

- Python 3.8 or higher installed
- Git for version control
- Raspberry Pi (for hardware examples in Phase 1)
- Basic electronics components (LEDs, resistors, buttons)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/smit4786/DetroitAutomationAcademy.git
   cd DetroitAutomationAcademy
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   python3 --version
   python3 test_examples.py
   ```

## Running Your First Example

### Software Simulation (No Hardware Required)

Start with the autonomous rover simulation:

```bash
python3 phase3/autonomous_rover.py
```

You should see an ASCII animation of a rover navigating a grid world with obstacles.

### Hardware Example (Raspberry Pi Required)

If you have a Raspberry Pi set up:

1. **Connect an LED:**
   - Connect LED anode (+) to GPIO pin 17 through a 220Ω resistor
   - Connect LED cathode (-) to GND

2. **Run the LED blink example:**
   ```bash
   sudo python3 phase1/led_blink.py
   ```

   Note: `sudo` is required for GPIO access on Raspberry Pi.

## Understanding the Code Structure

```
DetroitAutomationAcademy/
├── detroit_automation_academy.py  # Project overview
├── phase1/                        # Python fundamentals
│   ├── led_blink.py              # GPIO output example
│   └── button_press.py           # GPIO input example
├── phase3/                        # Autonomous systems
│   └── autonomous_rover.py       # Navigation simulation
├── test_examples.py              # Unit tests
└── docs/                         # Documentation
```

## Next Steps

1. **Explore the examples:**
   - Read the docstrings in each file
   - Modify parameters and observe changes
   - Add print statements for debugging

2. **Run the tests:**
   ```bash
   python3 test_examples.py
   ```

3. **Learn the curriculum:**
   - Phase 1: Focus on Python basics and GPIO control
   - Phase 2: CAD design and 3D printing (coming soon)
   - Phase 3: Autonomous navigation and sensor fusion

4. **Experiment:**
   - Try connecting different sensors
   - Modify the rover simulation
   - Create your own examples

## Troubleshooting

### Common Issues

**"Module 'RPi.GPIO' not found"**
- This is normal on non-Raspberry Pi systems
- The software simulations don't require GPIO hardware

**"Permission denied" on GPIO access**
- Use `sudo` to run GPIO scripts on Raspberry Pi
- Ensure your user is in the `gpio` group

**LED not lighting**
- Check circuit connections
- Verify correct pin numbers (use BCM numbering)
- Test with a multimeter

**Button not responding**
- Check wiring and pull-up resistor configuration
- Use `GPIO.input(pin)` to debug pin state

### Getting Help

- Check the detailed guides in `docs/`
- Review the API documentation
- Test individual components before integration
- Use print statements for debugging

## Development Workflow

1. **Make changes** to the code
2. **Run tests** to ensure functionality
3. **Test on hardware** if applicable
4. **Update documentation** for any new features
5. **Commit changes** with descriptive messages

Happy coding! 🚀