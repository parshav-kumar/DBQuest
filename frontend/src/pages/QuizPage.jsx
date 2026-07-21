import confetti from 'canvas-confetti'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import SQLEditor from '../components/SQLEditor'
import { useTheme } from '../context/ThemeContext'

function QuizPage() {
  const navigate = useNavigate()
  const { topicId, levelId } = useParams()
  const token = localStorage.getItem('token')
  const { theme } = useTheme()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [hint, setHint] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loadingHint, setLoadingHint] = useState(false)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const [loadingQuery, setLoadingQuery] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [queryResult, setQueryResult] = useState(null)
  const [queryError, setQueryError] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})

  const questions = {
    sql: {
      1: [
        {
          type: 'sql',
          scenario: `You are a data analyst at GlobalTech, a large software company. 
The HR manager has reported that some employee records seem incomplete. 
Your job is to investigate the employee database and help the HR team.

The employees table contains:
| employee_id | name          | department  | salary | active |
|-------------|---------------|-------------|--------|--------|
| 1           | Sarah Johnson | Engineering | 75000  | true   |
| 2           | James Smith   | Marketing   | 52000  | false  |
| 3           | Priya Patel   | Engineering | 81000  | true   |
| 4           | Omar Hassan   | HR          | 48000  | true   |
| 5           | Lisa Wong     | Marketing   | 61000  | false  |`,
          question: "The HR manager wants a full list of all employees. Write a SQL query to retrieve ALL columns from the employees table.",
          expected_result: [
            { employee_id: 1, name: "Sarah Johnson", department: "Engineering", salary: 75000, active: true },
            { employee_id: 2, name: "James Smith", department: "Marketing", salary: 52000, active: false },
            { employee_id: 3, name: "Priya Patel", department: "Engineering", salary: 81000, active: true },
            { employee_id: 4, name: "Omar Hassan", department: "HR", salary: 48000, active: true },
            { employee_id: 5, name: "Lisa Wong", department: "Marketing", salary: 61000, active: false },
          ],
          hint_context: "SELECT all columns from a table",
        },
        {
          type: 'sql',
          scenario: `Same employees table at GlobalTech.`,
          question: "The manager only wants to see employees from the Engineering department. Write a query to filter employees by department.",
          expected_result: [
            { employee_id: 1, name: "Sarah Johnson", department: "Engineering", salary: 75000, active: true },
            { employee_id: 3, name: "Priya Patel", department: "Engineering", salary: 81000, active: true },
          ],
          hint_context: "Filter rows using WHERE clause",
        },
        {
          type: 'sql',
          scenario: `Same employees table at GlobalTech.`,
          question: "The HR team wants a list of unique departments in the company. Write a query to retrieve distinct department names only.",
          expected_result: [
            { department: "Engineering" },
            { department: "Marketing" },
            { department: "HR" },
          ],
          hint_context: "Use SELECT DISTINCT to get unique values",
        },
        {
          type: 'sql',
          scenario: `Same employees table at GlobalTech.`,
          question: "Management wants to see only active employees (active = true). Write a query to retrieve all columns for active employees only.",
          expected_result: [
            { employee_id: 1, name: "Sarah Johnson", department: "Engineering", salary: 75000, active: true },
            { employee_id: 3, name: "Priya Patel", department: "Engineering", salary: 81000, active: true },
            { employee_id: 4, name: "Omar Hassan", department: "HR", salary: 48000, active: true },
          ],
          hint_context: "Use WHERE clause with a boolean condition",
        },
        {
          type: 'sql',
          scenario: `Same employees table at GlobalTech.`,
          question: "The payroll team needs only the name and salary columns for all employees. Write a query to retrieve just those two columns.",
          expected_result: [
            { name: "Sarah Johnson", salary: 75000 },
            { name: "James Smith", salary: 52000 },
            { name: "Priya Patel", salary: 81000 },
            { name: "Omar Hassan", salary: 48000 },
            { name: "Lisa Wong", salary: 61000 },
          ],
          hint_context: "Specify column names in SELECT instead of using *",
        },
      ],
      2: [
        {
          type: 'sql',
          scenario: `You are a database analyst at ShopEase, an e-commerce company.
You have two tables:

customers table:
| customer_id | name          | city      |
|-------------|---------------|-----------|
| 1           | Alice Brown   | Glasgow   |
| 2           | Bob Wilson    | Edinburgh |
| 3           | Carol Davis   | London    |
| 4           | David Miller  | Glasgow   |

orders table:
| order_id | customer_id | product    | amount |
|----------|-------------|------------|--------|
| 1        | 1           | Laptop     | 999    |
| 2        | 1           | Mouse      | 25     |
| 3        | 2           | Keyboard   | 75     |
| 4        | 4           | Monitor    | 350    |`,
          question: "The sales team wants to see all orders with the customer name alongside them. Write a query using INNER JOIN to combine the customers and orders tables.",
          expected_result: [
            { customer_id: 1, name: "Alice Brown", city: "Glasgow", order_id: 1, product: "Laptop", amount: 999 },
            { customer_id: 1, name: "Alice Brown", city: "Glasgow", order_id: 2, product: "Mouse", amount: 25 },
            { customer_id: 2, name: "Bob Wilson", city: "Edinburgh", order_id: 3, product: "Keyboard", amount: 75 },
            { customer_id: 4, name: "David Miller", city: "Glasgow", order_id: 4, product: "Monitor", amount: 350 },
          ],
          hint_context: "INNER JOIN returns only matching rows from both tables",
        },
        {
          type: 'sql',
          scenario: `Same ShopEase tables — customers and orders.`,
          question: "Management wants to see ALL customers, even those who haven't placed any orders yet. Write a LEFT JOIN query to show all customers with their orders (if any).",
          expected_result: [
            { customer_id: 1, name: "Alice Brown", city: "Glasgow", order_id: 1, product: "Laptop", amount: 999 },
            { customer_id: 1, name: "Alice Brown", city: "Glasgow", order_id: 2, product: "Mouse", amount: 25 },
            { customer_id: 2, name: "Bob Wilson", city: "Edinburgh", order_id: 3, product: "Keyboard", amount: 75 },
            { customer_id: 3, name: "Carol Davis", city: "London", order_id: null, product: null, amount: null },
            { customer_id: 4, name: "David Miller", city: "Glasgow", order_id: 4, product: "Monitor", amount: 350 },
          ],
          hint_context: "LEFT JOIN returns all rows from the left table and matching rows from the right",
        },
        {
          type: 'sql',
          scenario: `Same ShopEase tables — customers and orders.`,
          question: "The marketing team wants to find customers from Glasgow who have placed orders. Write a query using INNER JOIN and WHERE to find Glasgow customers with orders.",
          expected_result: [
            { name: "Alice Brown", city: "Glasgow", product: "Laptop", amount: 999 },
            { name: "Alice Brown", city: "Glasgow", product: "Mouse", amount: 25 },
            { name: "David Miller", city: "Glasgow", product: "Monitor", amount: 350 },
          ],
          hint_context: "Combine INNER JOIN with a WHERE clause to filter joined results",
        },
        {
          type: 'sql',
          scenario: `Same ShopEase tables — customers and orders.`,
          question: "The finance team wants to see all orders with amounts over 100, showing the customer name and product. Write a JOIN query with a WHERE filter.",
          expected_result: [
            { name: "Alice Brown", product: "Laptop", amount: 999 },
            { name: "David Miller", product: "Monitor", amount: 350 },
          ],
          hint_context: "Join tables first then filter with WHERE on the amount column",
        },
        {
          type: 'sql',
          scenario: `Same ShopEase tables — customers and orders.`,
          question: "The CEO wants a report showing customer names and their order amounts, ordered by amount from highest to lowest. Write the query.",
          expected_result: [
            { name: "Alice Brown", amount: 999 },
            { name: "David Miller", amount: 350 },
            { name: "Bob Wilson", amount: 75 },
            { name: "Alice Brown", amount: 25 },
          ],
          hint_context: "Join the tables and use ORDER BY with DESC to sort from highest to lowest",
        },
      ],
      3: [
        {
          type: 'sql',
          scenario: `You are a data analyst at Strathclyde University.
The academic team needs reports on student performance.

The results table contains:
| student_id | name          | course     | grade | year |
|------------|---------------|------------|-------|------|
| 1          | Ahmed Ali     | Databases  | 75    | 2024 |
| 2          | Emma Clark    | Databases  | 82    | 2024 |
| 3          | James Brown   | AI         | 91    | 2024 |
| 4          | Priya Singh   | AI         | 68    | 2024 |
| 5          | Omar Hassan   | Databases  | 55    | 2024 |
| 6          | Lisa Wong     | Networks   | 79    | 2024 |`,
          question: "The academic team wants to know how many students are enrolled in each course. Write a query using GROUP BY and COUNT to get the number of students per course.",
          expected_result: [
            { course: "Databases", count: 3 },
            { course: "AI", count: 2 },
            { course: "Networks", count: 1 },
          ],
          hint_context: "Use GROUP BY with COUNT(*) to count rows per group",
        },
        {
          type: 'sql',
          scenario: `Same Strathclyde University results table.`,
          question: "The exam board needs the average grade for each course. Write a query using GROUP BY and AVG to calculate the average grade per course.",
          expected_result: [
            { course: "Databases", avg_grade: 70.67 },
            { course: "Networks", avg_grade: 79 },
            { course: "AI", avg_grade: 79.5 },
          ],
          hint_context: "Use AVG() with GROUP BY to calculate average per group",
        },
        {
          type: 'sql',
          scenario: `Same Strathclyde University results table.`,
          question: "The Dean wants to see only courses where the average grade is above 75. Write a query using GROUP BY and HAVING to filter by average grade.",
          expected_result: [
            { course: "Networks", avg_grade: 79 },
            { course: "AI", avg_grade: 79.5 },
          ],
          hint_context: "Use HAVING to filter groups — HAVING works on aggregated values, WHERE does not",
        },
        {
          type: 'sql',
          scenario: `Same Strathclyde University results table.`,
          question: "The results office needs the highest and lowest grade in each course. Write a query to get MAX and MIN grade per course.",
          expected_result: [
            { course: "Databases", max_grade: 82, min_grade: 55 },
            { course: "Networks", max_grade: 79, min_grade: 79 },
            { course: "AI", max_grade: 91, min_grade: 68 },
          ],
          hint_context: "Use both MAX() and MIN() aggregate functions with GROUP BY",
        },
        {
          type: 'sql',
          scenario: `Same Strathclyde University results table.`,
          question: "The academic registry wants the total number of students and the overall average grade across ALL courses combined. Write a query without GROUP BY.",
          expected_result: [
            { total_students: 6, overall_average: 75 },
          ],
          hint_context: "Use COUNT(*) and AVG() without GROUP BY to get totals across the whole table",
        },
      ],
    },
    er: {
      1: [
        {
          type: 'mcq',
          scenario: `You are a database designer at City Hospital. The hospital needs a new database system to manage patients, doctors and appointments. Before writing any SQL, you must design an ER diagram.

The system needs to store:
- Patient details (ID, name, age, condition)
- Doctor details (ID, name, specialisation)
- Appointment details (date, time, room)`,
          question: "In your ER diagram for City Hospital, what shape would you use to represent the Patient entity?",
          options: ["Circle", "Diamond", "Rectangle", "Triangle"],
          answer: "Rectangle"
        },
        {
          type: 'mcq',
          scenario: `Same City Hospital ER diagram.`,
          question: "You need to show the relationship between Doctor and Patient — a doctor treats many patients. What shape represents this 'Treats' relationship in a Chen ER diagram?",
          options: ["Rectangle", "Circle", "Diamond", "Oval"],
          answer: "Diamond"
        },
        {
          type: 'mcq',
          scenario: `Same City Hospital ER diagram.`,
          question: "Each patient has a unique patient_id that identifies them in the system. What type of attribute is patient_id?",
          options: ["Multivalued attribute", "Derived attribute", "Key attribute", "Composite attribute"],
          answer: "Key attribute"
        },
        {
          type: 'mcq',
          scenario: `Same City Hospital ER diagram.`,
          question: "You need to add the patient's name as an attribute of the Patient entity. What shape represents a regular attribute in a Chen ER diagram?",
          options: ["Rectangle", "Diamond", "Triangle", "Oval"],
          answer: "Oval"
        },
        {
          type: 'mcq',
          scenario: `Same City Hospital ER diagram.`,
          question: "A patient can have multiple phone numbers — a home number and a mobile number. What shape represents this multivalued phone_number attribute?",
          options: ["A single oval", "A double oval", "A dashed oval", "A rectangle"],
          answer: "A double oval"
        },
      ],
      2: [
        {
          type: 'mcq',
          scenario: `You are designing a database for ShopEase, an e-commerce company. The system manages customers, products and orders. You are now working on the relationships between entities in the ER diagram.

Key facts:
- One customer can place many orders
- One order can contain many products
- One product can appear in many orders`,
          question: "The database needs to track how many orders each customer can place. What does cardinality describe in your ShopEase ER diagram?",
          options: [
            "The number of attributes an entity has",
            "The number of instances of one entity related to another",
            "The primary key of an entity",
            "The total number of entities"
          ],
          answer: "The number of instances of one entity related to another"
        },
        {
          type: 'mcq',
          scenario: `Same ShopEase ER diagram.`,
          question: "An order item only makes sense if an order exists — it cannot exist on its own. What shape represents this dependent OrderItem entity in a Chen ER diagram?",
          options: ["A single rectangle", "A double rectangle", "A dashed rectangle", "A diamond"],
          answer: "A double rectangle"
        },
        {
          type: 'mcq',
          scenario: `Same ShopEase ER diagram.`,
          question: "Many customers can purchase many products through orders. What type of relationship exists between Customer and Product?",
          options: ["1:1", "1:N", "M:N", "N:1"],
          answer: "M:N"
        },
        {
          type: 'mcq',
          scenario: `Same ShopEase ER diagram.`,
          question: "An OrderItem cannot be uniquely identified without knowing which Order it belongs to. What is an OrderItem in ER diagram terminology?",
          options: [
            "An entity with no attributes",
            "An entity that cannot be uniquely identified without a related entity",
            "An entity with only one attribute",
            "An entity with no relationships"
          ],
          answer: "An entity that cannot be uniquely identified without a related entity"
        },
        {
          type: 'mcq',
          scenario: `Same ShopEase ER diagram.`,
          question: "The relationship between Order and OrderItem is special because OrderItem depends on Order to exist. What is this type of relationship called?",
          options: ["Strong relationship", "Identifying relationship", "Weak relationship", "Partial relationship"],
          answer: "Identifying relationship"
        },
      ],
      3: [
        {
          type: 'mcq',
          scenario: `You are designing a database for Greenfield University. The system manages students, courses and lecturers. You are now working on advanced ER concepts.

Key facts:
- A student can enrol in many courses
- A course can be taught by many lecturers
- A lecturer can supervise many students
- Some staff are both lecturers and researchers (ISA hierarchy)`,
          question: "The university needs to model the relationship between Student, Course and Lecturer all at once — a student takes a course taught by a specific lecturer. How many entities are involved in this relationship?",
          options: ["1", "2", "3", "4"],
          answer: "3"
        },
        {
          type: 'mcq',
          scenario: `Same Greenfield University ER diagram.`,
          question: "The university has Staff who can be either Lecturers or Researchers — sharing common attributes like staff_id and name but having different specific attributes. What ER concept represents this?",
          options: [
            "A many-to-many relationship",
            "An inheritance or generalisation relationship",
            "A weak entity relationship",
            "A ternary relationship"
          ],
          answer: "An inheritance or generalisation relationship"
        },
        {
          type: 'mcq',
          scenario: `Same Greenfield University ER diagram.`,
          question: "Many students enrol in many courses. You cannot implement this M:N relationship directly in SQL. What must you create to convert it into a workable database structure?",
          options: [
            "Nothing extra is needed",
            "A junction table with foreign keys from both entities",
            "A new attribute in one of the tables",
            "A composite primary key in one table"
          ],
          answer: "A junction table with foreign keys from both entities"
        },
        {
          type: 'mcq',
          scenario: `Same Greenfield University ER diagram.`,
          question: "In the Staff ISA hierarchy, Staff is the parent entity and Lecturer and Researcher are the child entities. What is Staff called in this hierarchy?",
          options: ["Subclass", "Subtype", "Superclass", "Parent attribute"],
          answer: "Superclass"
        },
        {
          type: 'mcq',
          scenario: `Same Greenfield University ER diagram.`,
          question: "A student's age can be calculated from their date_of_birth — it doesn't need to be stored separately. What type of attribute is age in this ER diagram?",
          options: ["A double oval", "A dashed oval", "A rectangle", "A filled oval"],
          answer: "A dashed oval"
        },
      ],
    },
    normalisation: {
      1: [
        {
          type: 'mcq',
          scenario: `You are the database administrator at City Library. A librarian designed this table to track book loans:

| loan_id | member_name | books_borrowed        | due_dates              |
|---------|------------|----------------------|------------------------|
| 1       | Ahmed Ali  | SQL Guide, Python Pro | 2024-01-10, 2024-01-15 |
| 2       | Emma Clark | Database Design       | 2024-01-20             |

You need to fix this table to meet normalisation standards.`,
          question: "What is the main problem with the City Library loans table above?",
          options: [
            "No partial dependencies",
            "No transitive dependencies",
            "Multiple values in single cells violating 1NF",
            "All attributes depend on the primary key"
          ],
          answer: "Multiple values in single cells violating 1NF"
        },
        {
          type: 'mcq',
          scenario: `Same City Library loans table.`,
          question: "The books_borrowed column contains 'SQL Guide, Python Pro' in one cell. Which normal form does this violate?",
          options: ["2NF", "3NF", "1NF", "BCNF"],
          answer: "1NF"
        },
        {
          type: 'mcq',
          scenario: `Same City Library loans table.`,
          question: "To fix the table you need each cell to contain only one value. What does 1NF require values to be?",
          options: [
            "Values that can be split into smaller parts",
            "Values that cannot be divided further",
            "Values that are numeric only",
            "Values that are unique"
          ],
          answer: "Values that cannot be divided further"
        },
        {
          type: 'mcq',
          scenario: `Same City Library loans table.`,
          question: "Ahmed has borrowed 2 books so his row has multiple values in books_borrowed and due_dates. What are these called in normalisation terminology?",
          options: [
            "Partial dependencies",
            "Transitive dependencies",
            "Repeating groups",
            "Composite keys"
          ],
          answer: "Repeating groups"
        },
        {
          type: 'mcq',
          scenario: `Same City Library loans table.`,
          question: "After fixing the table for 1NF, each row has one book per loan. Which of these fixed rows is a correct atomic value?",
          options: [
            "books_borrowed = 'SQL Guide, Python Pro'",
            "books_borrowed = 'SQL Guide'",
            "books_borrowed = ['SQL Guide', 'Python Pro']",
            "books_borrowed = NULL"
          ],
          answer: "books_borrowed = 'SQL Guide'"
        },
      ],
      2: [
        {
          type: 'mcq',
          scenario: `You are a database analyst at SkyBook, an airport booking system. A developer created this flight_bookings table:

| booking_id | flight_id | passenger_name | passenger_email    | flight_destination |
|------------|-----------|---------------|--------------------|--------------------|
| 1          | FL101     | Ahmed Ali     | ahmed@email.com    | Paris              |
| 2          | FL101     | Emma Clark    | emma@email.com     | Paris              |
| 3          | FL202     | Ahmed Ali     | ahmed@email.com    | London             |

Primary key: (booking_id + flight_id)

You need to check if this table is in 2NF.`,
          question: "Looking at the SkyBook table, flight_destination depends only on flight_id — not on the full composite key (booking_id + flight_id). What type of dependency is this?",
          options: [
            "An attribute depends on the whole composite primary key",
            "An attribute depends on only part of a composite primary key",
            "An attribute depends on a non-key attribute",
            "An attribute has no dependency"
          ],
          answer: "An attribute depends on only part of a composite primary key"
        },
        {
          type: 'mcq',
          scenario: `Same SkyBook flight_bookings table.`,
          question: "The table has a composite primary key of (booking_id + flight_id). Which normal form specifically deals with problems caused by composite primary keys?",
          options: [
            "A single column primary key only",
            "A composite primary key",
            "No primary key",
            "A foreign key"
          ],
          answer: "A composite primary key"
        },
        {
          type: 'mcq',
          scenario: `Same SkyBook flight_bookings table.`,
          question: "To fix the partial dependency you need to move flight_destination to a separate table. What should this new table look like?",
          options: [
            "Remove flight_id from the original table",
            "Move flight_destination to a new Flights table with flight_id as its key",
            "Add more attributes to the original table",
            "Combine all attributes into one table"
          ],
          answer: "Move flight_destination to a new Flights table with flight_id as its key"
        },
        {
          type: 'mcq',
          scenario: `Same SkyBook flight_bookings table.`,
          question: "What does 2NF require in addition to being in 1NF?",
          options: [
            "No transitive dependencies",
            "No partial dependencies on the primary key",
            "All attributes must be atomic",
            "No multivalued attributes"
          ],
          answer: "No partial dependencies on the primary key"
        },
        {
          type: 'mcq',
          scenario: `Same SkyBook flight_bookings table.`,
          question: "If the SkyBook table had only booking_id as its primary key (not composite), would flight_destination still be a partial dependency?",
          options: [
            "Yes — it would still be partial",
            "No — a single column primary key cannot have partial dependencies",
            "Only if flight_id is removed",
            "Only if passenger_name is removed"
          ],
          answer: "No — a single column primary key cannot have partial dependencies"
        },
      ],
      3: [
        {
          type: 'mcq',
          scenario: `You are a database analyst at SafeBank. A developer created this accounts table:

| account_id | customer_id | customer_name | branch_id | branch_city |
|------------|-------------|---------------|-----------|-------------|
| 1001       | C01         | Ahmed Ali     | B01       | Glasgow     |
| 1002       | C02         | Emma Clark    | B01       | Glasgow     |
| 1003       | C03         | James Brown   | B02       | Edinburgh   |

Primary key: account_id

You need to check this table for 3NF compliance.`,
          question: "In the SafeBank table, branch_city depends on branch_id, which depends on account_id. What type of dependency is this?",
          options: [
            "A non-key attribute depends on another non-key attribute",
            "An attribute depends on part of the primary key",
            "An attribute has no dependency",
            "A primary key depends on a foreign key"
          ],
          answer: "A non-key attribute depends on another non-key attribute"
        },
        {
          type: 'mcq',
          scenario: `Same SafeBank accounts table.`,
          question: "branch_city is determined by branch_id, not directly by account_id. What is this called in normalisation?",
          options: [
            "Partial dependency",
            "Transitive dependency",
            "Functional dependency",
            "Composite dependency"
          ],
          answer: "Transitive dependency"
        },
        {
          type: 'mcq',
          scenario: `Same SafeBank accounts table.`,
          question: "To fix the transitive dependency you need to move branch_city out of the accounts table. Where should it go?",
          options: [
            "Remove branch_id from the original table",
            "Move branch_city to a new Branches table with branch_id as its key",
            "Add more columns to the accounts table",
            "Merge branch_id and branch_city into one column"
          ],
          answer: "Move branch_city to a new Branches table with branch_id as its key"
        },
        {
          type: 'mcq',
          scenario: `Same SafeBank accounts table.`,
          question: "After fixing the SafeBank table for 3NF, every non-key attribute must depend on what?",
          options: [
            "Another non-key attribute",
            "Part of the primary key",
            "The whole primary key and nothing but the key",
            "A foreign key"
          ],
          answer: "The whole primary key and nothing but the key"
        },
        {
          type: 'mcq',
          scenario: `Same SafeBank accounts table.`,
          question: "Which normal form specifically eliminates transitive dependencies like the one found in the SafeBank table?",
          options: ["1NF", "2NF", "3NF", "4NF"],
          answer: "3NF"
        },
      ],
    },
    fd: {
      1: [
        {
          type: 'mcq',
          scenario: `You are a database analyst at Grand Hotel. The hotel tracks reservations using this table:

| reservation_id | guest_id | guest_name | room_id | room_type | check_in   |
|----------------|----------|------------|---------|-----------|------------|
| R001           | G01      | Ahmed Ali  | 101     | Deluxe    | 2024-01-10 |
| R002           | G02      | Emma Clark | 102     | Standard  | 2024-01-11 |
| R003           | G01      | Ahmed Ali  | 103     | Suite     | 2024-01-15 |

You need to identify the functional dependencies in this table.`,
          question: "In the Grand Hotel table, knowing the guest_id tells you exactly one guest_name. How is this written as a functional dependency?",
          options: [
            "guest_name → guest_id",
            "guest_id → guest_name",
            "guest_id → room_id",
            "room_id → guest_id"
          ],
          answer: "guest_id → guest_name"
        },
        {
          type: 'mcq',
          scenario: `Same Grand Hotel reservations table.`,
          question: "You want to find the smallest set of attributes that uniquely identifies each reservation row. What is this called?",
          options: [
            "Any attribute in the table",
            "A minimal set of attributes that uniquely identifies a tuple",
            "Always a single attribute",
            "The same as a foreign key"
          ],
          answer: "A minimal set of attributes that uniquely identifies a tuple"
        },
        {
          type: 'mcq',
          scenario: `Same Grand Hotel reservations table.`,
          question: "You know that guest_id → guest_name. If you add room_id to both sides, which Armstrong axiom tells you that (guest_id, room_id) → (guest_name, room_id)?",
          options: ["Reflexivity", "Augmentation", "Transitivity", "Union"],
          answer: "Augmentation"
        },
        {
          type: 'mcq',
          scenario: `Same Grand Hotel reservations table.`,
          question: "You know that reservation_id → guest_id and guest_id → guest_name. Which Armstrong axiom tells you that reservation_id → guest_name?",
          options: ["Reflexivity", "Augmentation", "Transitivity", "Decomposition"],
          answer: "Transitivity"
        },
        {
          type: 'mcq',
          scenario: `Same Grand Hotel reservations table.`,
          question: "reservation_id alone uniquely identifies every row in the table but so does (reservation_id + guest_id) even though guest_id is unnecessary. What is (reservation_id + guest_id) called?",
          options: [
            "A minimal set of attributes that identifies a tuple",
            "Any set of attributes that uniquely identifies a tuple",
            "Always a single attribute",
            "A foreign key reference"
          ],
          answer: "Any set of attributes that uniquely identifies a tuple"
        },
      ],
      2: [
        {
          type: 'mcq',
          scenario: `You are a data analyst at StreamIt, an online streaming platform. The platform tracks movies using this table:

| movie_id | genre_id | genre_name | director_id | director_name | rating |
|----------|----------|------------|-------------|---------------|--------|

Functional dependencies:
- movie_id → director_id
- director_id → director_name
- genre_id → genre_name
- movie_id → rating

You need to analyse these FDs.`,
          question: "Starting from movie_id, what is the closure (movie_id)+ given the StreamIt FDs above?",
          options: [
            "{ movie_id, director_id }",
            "{ movie_id, director_id, director_name }",
            "{ movie_id, director_id, director_name, rating }",
            "{ movie_id, genre_id, genre_name, director_id, director_name, rating }"
          ],
          answer: "{ movie_id, director_id, director_name, rating }"
        },
        {
          type: 'mcq',
          scenario: `Same StreamIt platform FDs.`,
          question: "If (movie_id)+ contains ALL attributes of the relation, what does that tell you about movie_id?",
          options: [
            "It is a foreign key",
            "It is a partial key",
            "It is a superkey",
            "It is a derived attribute"
          ],
          answer: "It is a superkey"
        },
        {
          type: 'mcq',
          scenario: `Same StreamIt platform FDs.`,
          question: "You want to simplify the StreamIt FDs by removing redundancy. What is a minimal cover?",
          options: [
            "Redundant FDs removed and single attributes on the right side",
            "All possible FDs included",
            "Only one FD",
            "No left side attributes"
          ],
          answer: "Redundant FDs removed and single attributes on the right side"
        },
        {
          type: 'mcq',
          scenario: `Same StreamIt platform FDs.`,
          question: "To compute (movie_id)+, what do you start with?",
          options: [
            "An empty set",
            "All attributes of the relation",
            "movie_id itself",
            "The primary key"
          ],
          answer: "movie_id itself"
        },
        {
          type: 'mcq',
          scenario: `Same StreamIt platform FDs.`,
          question: "In the FD (movie_id, genre_id) → director_name, you already know that movie_id → director_name. What is genre_id in this context?",
          options: [
            "Is needed for the FD to hold",
            "Can be removed without changing the closure",
            "Is a primary key",
            "Appears on the right side only"
          ],
          answer: "Can be removed without changing the closure"
        },
      ],
    },
  }

  const topicQuestions = questions[topicId]?.[parseInt(levelId)] || []
  const currentQ = topicQuestions[currentQuestion]

  // ── Auto fetch AI explanation for MCQ correct answer ──
  const fetchExplanation = async (question, selectedAns, correctAns) => {
    setLoadingExplanation(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/ai/explain',
        {
          question: question,
          selected_answer: selectedAns,
          correct_answer: correctAns,
          topic: topicId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setExplanation(response.data.explanation)
    } catch {
      setExplanation('Could not load explanation.')
    }
    setLoadingExplanation(false)
  }

  // ── Auto fetch AI pro tip for SQL correct answer ──
  const fetchProTip = async (question, query) => {
    setLoadingExplanation(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/ai/protip',
        {
          question: question,
          selected_answer: query,
          correct_answer: '',
          topic: topicId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setExplanation(response.data.protip)
    } catch {
      setExplanation('Could not load pro tip.')
    }
    setLoadingExplanation(false)
  }

  // ── Handle SQL Query Submission ──
  const handleQuerySubmit = async (query) => {
    setLoadingQuery(true)
    setQueryError(null)
    setQueryResult(null)
    setExplanation('')

    try {
      const response = await axios.post(
        'http://localhost:8000/quiz/sql/execute',
        { query: query, expected_result: currentQ.expected_result },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const { correct, result, error } = response.data

      if (error) {
        setQueryError(error)
        setAnswered(true)
        setSelectedAnswer('error')
      } else {
        setQueryResult(result)
        setAnswered(true)
        setSelectedAnswer(correct ? 'correct' : 'incorrect')
        if (correct) {
          setScore(prev => prev + 1)
          fetchProTip(currentQ.question, query)
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#8b5cf6', '#22c55e']
          })
        }
      }
    } catch (err) {
      setQueryError('Could not connect to server.')
      setAnswered(true)
    }
    setLoadingQuery(false)
  }

  // ── Handle MCQ Answer ──
  const handleAnswer = (option) => {
    if (answered) return
    setSelectedAnswer(option)
    setAnswered(true)
    setUserAnswers(prev => ({ ...prev, [currentQuestion]: option }))
    if (option === currentQ.answer) {
      setScore(prev => prev + 1)
      fetchExplanation(currentQ.question, option, currentQ.answer)
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#22c55e']
      })
    }
  }

  // ── Handle AI Hint ──
  const handleHint = async () => {
    setLoadingHint(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/ai/hint',
        { question: currentQ.question, topic: topicId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setHint(response.data.hint)
    } catch {
      setHint('Could not load hint.')
    }
    setLoadingHint(false)
  }

  // ── Handle Next Question ──
  const handleNext = () => {
    setSelectedAnswer(null)
    setAnswered(false)
    setHint('')
    setExplanation('')
    setQueryResult(null)
    setQueryError(null)
    if (currentQuestion + 1 >= topicQuestions.length) {
      setQuizComplete(true)
    } else {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  // ── Handle Back ──
  const handleBack = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1
      const prevAnswer = userAnswers[prevQuestion] || null
      setCurrentQuestion(prevQuestion)
      setSelectedAnswer(prevAnswer)
      setAnswered(prevAnswer !== null)
      setHint('')
      setExplanation('')
      setQueryResult(null)
      setQueryError(null)
    } else {
      navigate(`/topic/${topicId}`)
    }
  }

  // ── Handle Finish ──
  const handleFinish = async () => {
    const percentage = (score / topicQuestions.length) * 100
    const passed = percentage >= 60
    try {
      await axios.post(
        'http://localhost:8000/progress',
        { topic: topicId, level: parseInt(levelId), score: percentage, passed },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (passed) {
        await axios.post(
          'http://localhost:8000/badges',
          { badge_name: `${topicId}_level_${levelId}` },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (err) {
      console.error('Error saving progress:', err)
    }
    navigate(`/results/${topicId}/${levelId}/${score}/${topicQuestions.length}`)
  }

  if (topicQuestions.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <p>Questions not found</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen px-6 py-8 ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className={`transition duration-200 ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ← Back
          </button>
          <div className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
            Question {currentQuestion + 1} of {topicQuestions.length}
          </div>
          <div className="text-blue-500 font-semibold">
            Score: {score}/{topicQuestions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full rounded-full h-2 mb-8 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentQuestion / topicQuestions.length) * 100}%` }}
          />
        </div>

        {!quizComplete ? (
          <>
            {/* Scenario Box */}
            {currentQ.scenario && (
              <div className={`border border-yellow-600 rounded-xl p-4 mb-4 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'
              }`}>
                <p className="text-yellow-500 text-xs font-bold mb-2">📋 SCENARIO</p>
                <pre className={`text-sm whitespace-pre-wrap font-mono leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {currentQ.scenario}
                </pre>
              </div>
            )}

            {/* Question */}
            <div className={`border rounded-xl p-6 mb-6 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h2 className={`text-xl font-semibold leading-relaxed ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {currentQ.question}
              </h2>
            </div>

            {/* SQL Editor or MCQ */}
            {currentQ.type === 'sql' ? (
              <>
                <SQLEditor onSubmit={handleQuerySubmit} loading={loadingQuery} />

                {/* Query Result Table */}
                {queryResult && queryResult.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <p className={`text-sm mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Query Result:
                    </p>
                    <table className={`w-full text-sm text-left border rounded-xl overflow-hidden ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <thead className={theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}>
                        <tr>
                          {Object.keys(queryResult[0]).map(col => (
                            <th key={col} className="px-4 py-2">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.map((row, i) => (
                          <tr key={i} className={
                            theme === 'dark'
                              ? i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'
                              : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }>
                            {Object.values(row).map((val, j) => (
                              <td key={j} className={`px-4 py-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {val === null ? 'NULL' : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Query Error */}
                {queryError && (
                  <div className="mt-4 bg-red-900 border border-red-600 rounded-xl p-4">
                    <p className="text-red-300 text-sm">❌ Error: {queryError}</p>
                  </div>
                )}

                {/* Correct/Incorrect Banner */}
                {answered && !queryError && (
                  <div className={`mt-4 rounded-xl p-4 border ${
                    selectedAnswer === 'correct'
                      ? 'bg-green-900 border-green-500'
                      : 'bg-red-900 border-red-500'
                  }`}>
                    <p className={`font-bold ${
                      selectedAnswer === 'correct' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {selectedAnswer === 'correct'
                        ? '✅ Correct! Your query returned the right result.'
                        : '❌ Incorrect. Your query returned a different result. Try again!'}
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* MCQ Options */
              <div className="flex flex-col gap-3 mb-6">
                {currentQ.options.map((option, index) => {
                  let style = theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700 hover:border-blue-500 cursor-pointer'
                    : 'bg-white border border-gray-200 hover:border-blue-500 cursor-pointer shadow-sm'
                  if (answered) {
                    if (option === currentQ.answer) style = 'bg-green-900 border border-green-500'
                    else if (option === selectedAnswer) style = 'bg-red-900 border border-red-500'
                    else style = theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700 opacity-50'
                      : 'bg-white border border-gray-200 opacity-50'
                  }
                  return (
                    <div
                      key={index}
                      onClick={() => handleAnswer(option)}
                      className={`${style} rounded-xl p-4 transition-all duration-200`}
                    >
                      <span className={
                        answered && (option === currentQ.answer || option === selectedAnswer)
                          ? 'text-white'
                          : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }>
                        {option}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* AI Hint Button — hidden once correct */}
            {selectedAnswer !== 'correct' && (
              <button
                onClick={handleHint}
                disabled={loadingHint}
                className="w-full bg-purple-800 hover:bg-purple-700 border border-purple-600
                           text-white py-3 rounded-xl mt-4 transition duration-200"
              >
                {loadingHint ? '🤖 Getting hint...' : '💡 Get AI Hint'}
              </button>
            )}

            {/* Hint Display */}
            {hint && (
              <div className="bg-purple-900 border border-purple-600 rounded-xl p-4 mt-4">
                <p className="text-purple-200 text-sm">
                  💡 <strong>Hint:</strong> {hint}
                </p>
              </div>
            )}

            {/* AI Pro Tip (SQL) or Explanation (MCQ) */}
            {answered && selectedAnswer === 'correct' && (
              <div className="bg-blue-900 border border-blue-600 rounded-xl p-4 mt-4">
                {loadingExplanation ? (
                  <p className="text-blue-200 text-sm">
                    {currentQ.type === 'sql' ? '💡 Getting pro tip...' : '🤖 Getting explanation...'}
                  </p>
                ) : (
                  <p className="text-blue-200 text-sm">
                    {currentQ.type === 'sql' ? '💡' : '🤖'}
                    <strong> {currentQ.type === 'sql' ? 'Pro Tip:' : 'Explanation:'}</strong> {explanation}
                  </p>
                )}
              </div>
            )}

            {/* Next Button */}
            {answered && (topicId !== 'sql' || selectedAnswer === 'correct') && (
              <button
                onClick={handleNext}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold
                           py-3 rounded-xl transition duration-200 mt-4"
              >
                {currentQuestion + 1 >= topicQuestions.length ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </>
        ) : (
          /* Quiz Complete */
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {score / topicQuestions.length >= 0.6 ? '🎉' : '😔'}
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {score / topicQuestions.length >= 0.6 ? 'Level Complete!' : 'Not Quite!'}
            </h2>
            <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              You scored {score} out of {topicQuestions.length}
            </p>
            <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {score / topicQuestions.length >= 0.6
                ? '✅ You passed! Next level unlocked.'
                : '❌ You need 60% to pass. Try again!'}
            </p>
            <button
              onClick={handleFinish}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold
                         py-3 px-8 rounded-xl text-lg transition duration-200"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPage