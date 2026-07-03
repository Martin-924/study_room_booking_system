# Development Log

## Project: Study Room Booking System
**Student:** Mugabo Alain (26450)  
**Course:** BIT312 - Web Technology and Internet  
**Date:** May 18-19, 2026

---

## Development Timeline

### Phase 1: Project Setup & Planning (May 18, 2026 - Morning)

**Objectives:**
- Define project requirements
- Design database schema
- Set up development environment

**Activities:**
1. Created project structure with separate backend and frontend folders
2. Initialized Spring Boot project with Maven
3. Initialized React project with Create React App
4. Designed database schema for Rooms and Bookings tables
5. Planned RESTful API endpoints

**Decisions Made:**
- Used PostgreSQL for reliability and ACID compliance
- Chose Spring Boot for rapid backend development
- Selected React for dynamic, component-based frontend
- Implemented UUID for primary keys to avoid enumeration attacks

---

### Phase 2: Backend Development (May 18, 2026 - Afternoon)

**Objectives:**
- Implement Spring Boot REST API
- Create JPA entities and repositories
- Set up database connection

**Activities:**

#### 2.1 Database Configuration
- Configured `application.properties` with PostgreSQL connection
- Set up JPA auto-DDL for automatic schema generation
- Enabled Hibernate SQL logging for debugging

#### 2.2 Entity Layer
- Created `Room` entity with fields: id, name, capacity, location, available
- Created `Booking` entity with fields: id, studentName, studentId, roomId, bookingDate, timeSlot, released
- Implemented proper JPA annotations (@Entity, @Id, @GeneratedValue)
- Used Lombok annotations to reduce boilerplate code

#### 2.3 Repository Layer
- Implemented `RoomRepository` extending JpaRepository
- Implemented `BookingRepository` extending JpaRepository
- Added custom query methods for finding bookings by room

#### 2.4 Service Layer
- Created `RoomService` with business logic for room management
- Created `BookingService` with booking creation and cancellation logic
- Implemented room availability update logic
- Added booking release functionality

#### 2.5 Controller Layer
- Implemented `RoomController` with CRUD endpoints
- Implemented `BookingController` with booking management endpoints
- Enabled CORS for frontend communication
- Added proper HTTP status codes and response handling

#### 2.6 Data Initialization
- Created `DataLoader` component to populate initial sample data
- Added 5 sample rooms with different capacities and locations

**Challenges Faced:**
- Initial CORS issues - resolved by adding @CrossOrigin annotation
- Room availability not updating - fixed by implementing proper service layer logic
- UUID generation - resolved by using @GeneratedValue with UUID strategy

---

### Phase 3: Frontend Development (May 18, 2026 - Evening)

**Objectives:**
- Build React components for all pages
- Implement API integration with Axios
- Create user-friendly interface

**Activities:**

#### 3.1 Project Setup
- Installed dependencies: react-router-dom, axios
- Set up routing in App.js
- Created component folder structure

#### 3.2 Rooms Page Component
- Displayed all rooms in a responsive grid layout
- Implemented "Add New Room" form
- Added real-time room availability status display
- Styled with inline CSS for clean appearance

#### 3.3 Booking Page Component
- Created booking form with all required fields
- Implemented dynamic room dropdown (only available rooms)
- Added time slot selection with predefined options
- Implemented form validation and error handling
- Added success/error message notifications

#### 3.4 Bookings List Component
- Displayed all bookings in a table format
- Implemented "Release" button functionality
- Implemented "Cancel" button functionality
- Added confirmation for destructive actions
- Showed booking status (Released/Active)

#### 3.5 Navigation & Styling
- Created navigation menu for easy page switching
- Applied consistent styling across all pages
- Made interface intuitive and user-friendly
- Added hover effects and visual feedback

**Challenges Faced:**
- Async state updates - resolved using proper useEffect dependencies
- Room dropdown not refreshing - fixed by fetching rooms on component mount
- Delete confirmation - added window.confirm for better UX

---

### Phase 4: Integration & Testing (May 19, 2026 - Morning)

**Objectives:**
- Test all features end-to-end
- Fix bugs and edge cases
- Verify database operations

**Activities:**

#### 4.1 Backend Testing
- Tested all API endpoints using browser and Postman
- Verified database schema creation
- Checked data persistence and relationships
- Tested room availability logic
- Verified booking release functionality

#### 4.2 Frontend Testing
- Tested room creation and display
- Tested booking creation with various inputs
- Tested booking cancellation and release
- Verified error handling for invalid inputs
- Checked UI responsiveness

#### 4.3 Integration Testing
- Tested complete user workflows:
  - Add room → Book room → View booking → Release booking
  - Add room → Book room → Cancel booking
  - Multiple bookings for different rooms
- Verified data consistency between frontend and backend
- Checked real-time updates after operations

#### 4.4 Database Verification
- Connected to PostgreSQL and verified table structures
- Ran SQL queries to check data integrity
- Verified foreign key relationships
- Took screenshots of database tables for documentation

**Bugs Fixed:**
1. Room not becoming available after booking cancellation - Fixed in BookingService
2. Dropdown showing booked rooms - Added filter in RoomsPage component
3. Date format inconsistency - Standardized to ISO format (YYYY-MM-DD)
4. Success messages not clearing - Added timeout to clear messages

---

### Phase 5: Documentation & Deployment Preparation (May 19, 2026 - Afternoon)

**Objectives:**
- Create comprehensive documentation
- Prepare for GitHub submission
- Clean up code and remove unnecessary files

**Activities:**

#### 5.1 Documentation
- Created detailed README.md with:
  - Project overview and problem statement
  - Technology stack and architecture
  - Installation and setup instructions
  - API documentation with examples
  - Usage guide with screenshots
  - Troubleshooting section
- Created DEVELOPMENT.md (this file) documenting the development process
- Added inline code comments for clarity
- Documented all API endpoints

#### 5.2 Code Cleanup
- Removed unused imports and variables
- Formatted code consistently
- Removed console.log statements
- Cleaned up commented-out code
- Verified .gitignore excludes build artifacts

#### 5.3 Git & GitHub
- Initialized git repository
- Created .gitignore for Java and Node.js
- Made initial commit with descriptive message
- Pushed to GitHub repository
- Verified all files uploaded correctly

---

## Technical Decisions & Rationale

### Why Spring Boot?
- Rapid development with auto-configuration
- Built-in dependency injection
- Excellent JPA/Hibernate integration
- Easy REST API creation
- Large community and documentation

### Why React?
- Component-based architecture for reusability
- Virtual DOM for performance
- Hooks for state management
- Large ecosystem of libraries
- Easy to learn and maintain

### Why PostgreSQL?
- ACID compliance for data integrity
- Excellent performance for relational data
- Strong support for JPA/Hibernate
- Free and open-source
- Industry-standard database

### Why UUID for Primary Keys?
- Prevents ID enumeration attacks
- Globally unique identifiers
- Better for distributed systems
- No sequential ID guessing

---

## Key Features Implemented

### Backend (Spring Boot)
✅ RESTful API with proper HTTP methods  
✅ JPA entities with relationships  
✅ Repository pattern for data access  
✅ Service layer for business logic  
✅ CORS enabled for frontend  
✅ Automatic schema generation  
✅ Sample data initialization  
✅ Room availability management  
✅ Booking release functionality  

### Frontend (React)
✅ Single Page Application with routing  
✅ Three main pages (Rooms, Booking, Bookings List)  
✅ Real-time data fetching  
✅ Form validation  
✅ Error handling  
✅ Success/error notifications  
✅ Dynamic dropdowns  
✅ One-click actions  
✅ Clean, intuitive UI  

---

## Lessons Learned

1. **Planning is crucial:** Spending time on database design saved hours of refactoring
2. **Service layer matters:** Separating business logic from controllers made code cleaner
3. **State management:** Understanding React hooks and async operations is essential
4. **Error handling:** Always handle errors gracefully and provide user feedback
5. **Testing early:** Testing each component as built prevented integration issues
6. **Documentation:** Good documentation makes the project easier to understand and maintain

---

## Future Improvements

If I had more time, I would add:
- User authentication with JWT tokens
- Role-based access control (Student, Admin)
- Email notifications for bookings
- Calendar view for better visualization
- Search and filter functionality
- Booking history and analytics
- Real-time updates with WebSockets
- Mobile app version
- Unit and integration tests
- Docker containerization

---

## Conclusion

This project successfully demonstrates a full-stack web application using modern technologies. The system solves a real problem faced by students and provides a clean, intuitive interface for managing study room bookings. The code is well-structured, documented, and ready for further enhancement.

**Total Development Time:** ~12 hours  
**Lines of Code:** ~1,500 (Backend: ~800, Frontend: ~700)  
**Commits:** Multiple with descriptive messages  
**Status:** ✅ Complete and functional

---

**Developed by Mugabo Alain (26450)**  
**May 18-19, 2026**
