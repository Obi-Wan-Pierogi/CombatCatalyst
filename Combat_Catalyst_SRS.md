**IT 460 Capstone: Software Requirements Specification (SRS)**

**Project Name:** The Combat Catalyst

**Author:** Lee Houk

**Version:** 0.2 (Milestone 1 Update)
________________________________________
**Changelog v0.2 (Milestone 1 Update):**
*	**Tech Stack Revision:** Transitioned database persistence from SQL Server to SQLite via Entity Framework Core to better support lightweight, local execution of the engine.
*	**Architecture Update:** Defined Frontend State Management strategy. Selected Zustand over Redux, implementing a strict Facade Design Pattern (useCombatEngine) to shield UI components from raw state mutation logic.
*	**Data Modeling:** Expanded Section 2.3 (Polymorphic Data Mapping) to distinguish between static Monster API data and the dynamic ActiveCombatant state model. Added explicit tracking for instanceId (to support multiple identical combatants), deathSaveSuccesses/Failures, and hasReactionAvailable to satisfy MVP functional requirements.
________________________________________
**1. Project Overview**
   
The Combat Catalyst is a specialized encounter management tool for Dungeons & Dragons 5th Edition. The project aims to streamline the most complex aspect of tabletop gaming: combat. By integrating with external APIs and utilizing a custom-built rules engine, the software will automate the manual "bookkeeping" of initiative, health tracking, and action resolution. The system is built using a React frontend for high responsiveness and a C# (.NET) backend for robust, type-safe game logic.
________________________________________
**2. Difficult to Explain Areas (Core Logic)**
   
**2.1 The "Attack-to-Damage" Confirmation Pipeline**

Unlike standard data-entry forms, a D&D combat turn involves "interrupt logic." In a typical software workflow, clicking a button executes an action immediately. In D&D, an "Attack" roll is only a proposal until the Dungeon Master confirms it.
*	**The Logic:** When a DM triggers a monster attack, the backend calculates the potential outcome (To-Hit and Damage). However, the system must enter a "Pending" state. A modal appears in the UI, allowing the DM to pause and ask the players for reactions (like the Shield spell). The backend must store this transient state until the DM provides a "Commit," "Modify," or "Cancel" command. Managing this asynchronous "human-in-the-loop" validation is the most complex state-management challenge of the project.
________________________________________

**2.2 Dynamic Resource Reset and Round Tracking**

Tracking "Limited Resources," such as Legendary Actions or Reactions, requires the system to act as an automated referee that monitors the "Turn Pointer."
*	**The Logic:** The application uses a central "Round Controller." Every time the active turn shifts to a new creature, a background trigger must check the entity's type and status. If the entity is a "Legendary Creature," the system must automatically reset its "Action Currency." This requires a sophisticated "Observer Pattern" or a state-machine that triggers specific logic based on the round counter and the initiative order, ensuring the DM never has to manually refresh boss abilities.

**2.3 Polymorphic Data Mapping**
 	
Monsters retrieved from the Open5e API do not follow a uniform structure; a "Zombie" has three data points, while a "Ancient Red Dragon" has dozens of actions, resistances, and legendary traits.
*	**The Logic:** To handle this, the C# backend will utilize Data Transfer Objects (DTOs) and polymorphic mapping. Furthermore, the system utilizes a strict architectural split between static Monster metadata (fetched from the API) and the dynamic ActiveCombatant interface used in the combat engine. The ActiveCombatant model introduces an instanceId to handle multiple identical monsters (e.g., three Goblins) simultaneously, alongside dynamic tracking for deathSaveSuccesses, deathSaveFailures, and hasReactionAvailable. The challenge lies in creating a "General Combatant" model that can dynamically render UI components in React only when specific data exists. If the JSON contains "Spellcasting," the UI must generate a spell menu; otherwise, it must remain hidden to prevent clutter.
________________________________________
**3. Functional Requirements**
*	**FR1: Data Ingestion:** The system shall fetch monster stat blocks from the Open5e API and persist them in a local database for offline use during sessions.
*	**FR2: Initiative Management:** The system shall sort combatants based on a mix of automated rolls (monsters) and manual entry (players).
*	**FR3: Automated Calculations:** The system shall calculate attack rolls and damage totals based on 5e SRD rules.
*	**FR4: Manual Overrides:** The system shall provide a confirmation step for all automated actions to allow for DM intervention and player reactions.
*	**FR5: State Tracking:** The system shall track health, "Downed/Death Save" status (including specific successes and failures), and limited-use resources like Legendary Actions and Reactions. The system will use unique instance tracking (instanceId) to manage states for multiple identical creature types in the same encounter.
*	**FR6: Group Logic:** The system shall support "Group Saves," allowing the DM to roll a single saving throw for a group of identical enemies while displaying individual success/failure results.
________________________________________
**4. System Architecture & Tech Stack**
*	**Frontend:** React (JavaScript/TypeScript) – Chosen for its ability to handle dynamic, real-time UI updates during fast-paced combat. Frontend state is managed via Zustand utilizing the Facade Design Pattern (useCombatEngine) to isolate strict state machine logic from the UI components.
*	**Backend:** C# (.NET) – Utilized for the core rules engine to ensure high performance and strict logical accuracy.
*	**Database:** Entity Framework Core with SQLite – For lightweight, local persistent storage of campaign data, player characters, and imported monsters without requiring a heavy background service.
*	**Documentation:** Mermaid.js – Used for generating live-updating System Analysis diagrams (Sequence and Class diagrams).
________________________________________
**5. Future Expansion**
*	**Player Portal:** A mobile-responsive view for players to track their own HP and status effects in real-time.
*	**Procedural Content:** Integration of a dungeon and loot generator to assist DMs with "on-the-fly" session management.
*	**VTT Lite:** A 2D coordinate system for tracking "Theater of the Mind" distances and positioning.

