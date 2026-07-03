@echo off
echo ========================================
echo CLEANING PROJECT FOR SUBMISSION
echo ========================================
echo.

echo Removing backend target folder...
if exist "study-room-booking-backend\target" (
    rmdir /s /q "study-room-booking-backend\target"
    echo ✓ Backend target folder removed
) else (
    echo ✓ Backend target folder not found
)

echo.
echo Removing frontend node_modules folder...
if exist "study-room-booking-frontend\node_modules" (
    rmdir /s /q "study-room-booking-frontend\node_modules"
    echo ✓ Frontend node_modules folder removed
) else (
    echo ✓ Frontend node_modules folder not found
)

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Your project is now ready for submission.
echo You can now zip the folder and upload it.
echo.
pause
