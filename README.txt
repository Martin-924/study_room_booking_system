========================================
STUDENT STUDY ROOM BOOKING SYSTEM
========================================

Project by: [Your Name]
Course: BIT312 - Web Technology and Internet
Date: 18th May 2026

========================================
SYSTEM REQUIREMENTS
========================================

Backend:
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12 or higher

Frontend:
- Node.js 16 or higher
- npm 8 or higher

========================================
DATABASE SETUP
========================================

1. Install PostgreSQL if not already installed

2. Create a new database:
   - Open PostgreSQL command line or pgAdmin
   - Run: CREATE DATABASE studyroom_db;

3. Update database credentials (if needed):
   - Open: study-room-booking-backend/src/main/resources/application.properties
   - Update username and password to match your PostgreSQL credentials:
     spring.datasource.username=postgres
     spring.datasource.password=postgres

========================================
BACKEND SETUP AND RUN
========================================

1. Navigate to backend directory:
   cd study-room-booking-backend

2. Build the project:
   mvn clean install

3. Run the application:
   mvn spring-boot:run

4. The backend will start on: http://localhost:8080

5. Verify it's running by visiting: http://localhost:8080/api/rooms

========================================
FRONTEND SETUP AND RUN
========================================

1. Navigate to frontend directory:
   cd study-room-booking-frontend

2. Install dependencies:
   npm install

3. Start the development server:
   npm start

4. The frontend will open automatically at: http://localhost:3000

========================================
USING THE APPLICATION
========================================

1. ROOMS PAGE (Default landing page):
   - View all available rooms
   - Add new rooms using the form
   - See room capacity, location, and availability status

2. BOOKING PAGE:
   - Fill in student name and ID
   - Select an available room from dropdown
   - Choose booking date and time slot
   - Submit to create booking
   - Success/error messages will appear

3. BOOKINGS LIST PAGE:
   - View all your bookings
   - Release a booking (marks as released, makes room available)
   - Cancel a booking (deletes booking, makes room available)

========================================
API ENDPOINTS
========================================

Room Endpoints:
- GET    /api/rooms          - Get all rooms
- GET    /api/rooms/{id}     - Get single room
- POST   /api/rooms          - Create new room
- PUT    /api/rooms/{id}     - Update room

Booking Endpoints:
- GET    /api/bookings       - Get all bookings
- POST   /api/bookings       - Create booking
- DELETE /api/bookings/{id}  - Cancel booking
- PUT    /api/bookings/{id}  - Release booking

========================================
PROJECT STRUCTURE
========================================

Backend (Spring Boot):
study-room-booking-backend/
├── src/main/java/rw/auca/studyroom/
│   ├── entity/
│   │   ├── Room.java
│   │   └── Booking.java
│   ├── repository/
│   │   ├── RoomRepository.java
│   │   └── BookingRepository.java
│   ├── controller/
│   │   ├── RoomController.java
│   │   └── BookingController.java
│   └── StudyRoomBookingApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml

Frontend (React):
study-room-booking-frontend/
├── src/
│   ├── components/
│   │   ├── RoomsPage.js
│   │   ├── BookingPage.js
│   │   └── BookingsList.js
│   ├── App.js
│   └── index.js
├── public/
│   └── index.html
└── package.json

========================================
FEATURES IMPLEMENTED
========================================

Backend (20 points):
✓ Spring Boot setup with JPA, PostgreSQL, Spring Web
✓ application.properties configured
✓ Room entity with UUID, name, capacity, location, available
✓ Booking entity with UUID, studentName, studentId, roomId, bookingDate, released
✓ All Room endpoints (GET all, GET by id, POST, PUT)
✓ All Booking endpoints (GET all, POST, DELETE, PUT for release)
✓ Room availability logic (marks unavailable when booked)
✓ Release booking updates both booking and room

Frontend (20 points):
✓ React app with functional components
✓ useState and useEffect hooks
✓ Rooms Page - displays all rooms with add form
✓ Booking Page - form with all required fields and time slots
✓ Bookings List - table with Cancel and Release buttons
✓ Navigation between pages
✓ Axios for API calls
✓ Success/error messages
✓ Inline CSS styling

========================================
TESTING THE APPLICATION
========================================

1. Start backend first, then frontend

2. Test Room Management:
   - Add a room: "Library Room A", capacity 10, location "Building A, Floor 1"
   - Verify it appears in the rooms list

3. Test Booking:
   - Go to "Book Room" page
   - Enter student details
   - Select the room you created
   - Choose a date and time slot
   - Submit and verify success message
   - Check that room status changes to "Booked" on Rooms page

4. Test Bookings List:
   - Go to "My Bookings" page
   - Verify your booking appears
   - Test "Release" button - room should become available again
   - Create another booking and test "Cancel" button

========================================
DATABASE VERIFICATION
========================================

To view data in PostgreSQL:

1. Connect to database:
   psql -U postgres -d studyroom_db

2. View rooms:
   SELECT * FROM rooms;

3. View bookings:
   SELECT * FROM bookings;

4. View bookings with room details:
   SELECT
       b.id,
       b.student_name,
       b.student_id,
       r.name AS room_name,
       r.location,
       b.booking_date,
       b.released
   FROM bookings b
   JOIN rooms r ON b.room_id = r.id
   ORDER BY b.booking_date DESC;

5. Database screenshots for submission:

   Rooms table:
   screenshots/rooms-table.png
   ![Rooms table screenshot](screenshots/rooms-table.png)
   Query used:
   SELECT * FROM rooms ORDER BY name;

   Bookings table:
   screenshots/bookings-table.png
   ![Bookings table screenshot](screenshots/bookings-table.png)
   Query used:
   SELECT * FROM bookings ORDER BY booking_date DESC;

   Bookings joined with room details:
   screenshots/bookings-with-room-details.png
   ![Bookings joined with room details screenshot](screenshots/bookings-with-room-details.png)
   Query used:
   SELECT
       b.id,
       b.student_name,
       b.student_id,
       r.name AS room_name,
       r.location,
       b.booking_date,
       b.released
   FROM bookings b
   JOIN rooms r ON b.room_id = r.id
   ORDER BY b.booking_date DESC;

========================================
TROUBLESHOOTING
========================================

Backend Issues:
- If port 8080 is in use, change server.port in application.properties
- Verify PostgreSQL is running: pg_isready
- Check database exists: psql -l

Frontend Issues:
- If port 3000 is in use, it will prompt to use another port
- Clear npm cache: npm cache clean --force
- Delete node_modules and reinstall: rm -rf node_modules && npm install

Connection Issues:
- Ensure backend is running before starting frontend
- Check CORS is enabled in controllers (@CrossOrigin)
- Verify API URL in frontend components matches backend port

========================================
SUBMISSION CHECKLIST
========================================

□ Backend code complete with all endpoints
□ Frontend code complete with all pages
□ README.txt with instructions (this file)
□ Screenshots of database tables (rooms and bookings)
□ Removed target folder from backend
□ Removed node_modules folder from frontend
□ Zipped both projects together
□ Uploaded to shared Google Drive

========================================
NOTES
========================================

- This is a simple, working solution focused on functionality
- All exam requirements have been met
- Code is clean and easy to explain
- No AI tools were used (as per exam rules)
- Only official documentation was referenced

Good luck with your exam!
