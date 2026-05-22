# Implementation Plan

## Project Title

Smart Ambulance Routing and Hospital Allocation System

## Goal

Build a Java-based application that recommends the best hospital for an emergency case by combining:
- emergency-type matching
- hospital resource availability
- weighted graph shortest-path calculation

## Why This Project Is Strong

- It is not a basic CRUD-only project.
- It includes meaningful algorithmic logic.
- Graph Theory is central, not forced.
- It is realistic for a 4th semester student to implement.
- Each subject contribution is clearly visible during demo and viva.

## Problem Definition

In real emergencies, choosing the nearest hospital may lead to delay because the nearest hospital may not have the required facility or available bed. The system should recommend the most suitable hospital that is also reachable using the best route.

## Scope for Version 1

### Included
- patient emergency entry
- hospital master data
- department/specialization support
- bed and ICU availability
- graph representation of roads
- BFS and DFS utility operations
- Dijkstra shortest path
- recommendation of primary and backup hospitals
- Swing-based demo UI

### Not Included in Version 1
- real-time GPS
- live traffic APIs
- mobile app
- ambulance tracking devices
- map rendering libraries

## Subject-Wise Planning

### BCS401
- Define the problem formally
- Compare brute-force hospital search with graph-based routing
- Explain why Dijkstra is suitable for weighted road networks
- Show time complexity of BFS, DFS, and Dijkstra

### BCS403
- Prepare ER diagram
- Convert entities into relational schema
- Normalize the core tables up to 3NF
- Write sample SQL queries
- Add JDBC-ready repository structure

### BCS402
- Use OOP with clear package structure
- Use Swing for UI
- Use Java Collections in graph and recommendation logic
- Add JDBC connector class for later DB integration

### BCS405B
- Model the city as a weighted graph
- Use adjacency list
- Implement BFS, DFS, and Dijkstra
- Use route cost for hospital recommendation

## High-Level Modules

### Module 1: Emergency Case Entry
- accept patient name
- choose location
- choose emergency type
- choose ICU requirement

### Module 2: Hospital Resource Management
- hospital information
- specialization list
- ICU and general bed availability

### Module 3: Road Network Engine
- nodes and edges
- adjacency list
- graph traversal and shortest path

### Module 4: Recommendation Engine
- filter candidate hospitals
- compute route cost
- rank candidates
- select best and backup hospitals

### Module 5: Reporting and History
- show result explanation
- support future storage of allocation history

## Planned Package Structure

```text
src/ambulance/
  App.java
  model/
  graph/
  service/
  ui/
```

## Initial Class Plan

### Model
- `EmergencyType`
- `Patient`
- `Hospital`
- `LocationNode`
- `EmergencyRequest`
- `HospitalRecommendation`

### Graph
- `RoadEdge`
- `PathResult`
- `CityGraph`

### Service
- `SampleDataFactory`
- `RecommendationService`

### UI
- `MainFrame`

## Recommendation Logic Plan

1. receive emergency request
2. fetch hospitals
3. filter by matching emergency type
4. filter by ICU/general bed need
5. run shortest-path search from source
6. score valid hospitals
7. return best hospital and backups

## Sample Data Plan

Use a small, easy-to-demo network:
- 6 to 8 location nodes
- 4 hospitals
- different specialties
- varied ICU/general bed counts

This makes the demo understandable and lets the algorithm visibly choose between options.

## Database Plan for Next Step

### Tables
- `patients`
- `emergency_cases`
- `hospitals`
- `hospital_specializations`
- `hospital_resources`
- `location_nodes`
- `road_edges`
- `allocations`

### JDBC Work After Scaffold
- replace sample data with SQL fetch
- store emergency case details
- store recommendation/allocation history

## Demo Plan

### Demo Case 1
- nearest hospital is suitable
- system recommends nearest valid option

### Demo Case 2
- nearest hospital lacks ICU
- system picks second hospital with valid route

### Demo Case 3
- multiple hospitals are valid
- Dijkstra decides the best route

## Build Plan

### Step 1
- create docs and package structure

### Step 2
- implement model classes

### Step 3
- implement graph and shortest path

### Step 4
- implement recommendation engine

### Step 5
- add Swing UI

### Step 6
- compile and test

## Viva Explanation Line

"The project uses DBMS to store hospitals and roads, Advanced Java to build the application, Graph Theory to model and solve routing, and Algorithm Design to compare and justify the recommendation strategy."
