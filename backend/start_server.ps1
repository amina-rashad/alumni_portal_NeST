# This script activates the virtual environment and starts the Flask server.
if (Test-Path ".\venv\Scripts\Activate.ps1") {
    . .\venv\Scripts\Activate.ps1
}
python run.py
