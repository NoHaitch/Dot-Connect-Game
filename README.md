<!-- Back to Top Link-->
<a name="readme-top"></a>


<br />
<div align="center">
  <h1 align="center">Dot-Connect Game</h1>

  <p align="center">
    <h4>Dot Connect Game Web App</h4>
    <br/>
    <a href="https://github.com/NoHaitch/Dot-Connect-Game/issues">Report Bug</a>
    ·
    <a href="https://github.com/NoHaitch/Dot-Connect-Game/issues">Request Feature</a>
<br>
<br>

[![MIT License][license-shield]][license-url]

  </p>
</div>

<!-- CONTRIBUTOR -->
<div align="center" id="contributor">
  <strong>
    <h3>Made By:</h3>
    <h3>Raden Francisco Trianto Bratadiningrat</h3>
    <h3>13522091</h3>
  </strong>
  <br>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#algorithm-implemented">Algorithm Implemented</a></li>
    <li><a href="#bonus">Bonus</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#instruction">Instruction</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Dot-Connect is a simple game with the objective is to use connect all the usable dots given. 
You must connect all the dots in the board starting from the starting point. 
You can only connect the dots that are adjacent to each other (left, right, top, bottom).
To win you must connect all the dots in the board without any dots left unconnected.

This web app is made to play the game using the browser. This project also include a backend server to handle the game 
logic as well as data storage using sql database. The backend server is made using Golang Gin and the frontend is made using React with tailwind.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TECH STACK -->
## Tech Stack

- Frontend: React framework with tailwind css
- Backend: Golang using Gin framework

<!-- Algorithm implemented  -->
## Algorithm implemented


### Brute Force: Checking all possible path 
Time complexity: O(4^n), space complexity O(n), n: amount of cell in the board
1. Pre-check if the board is possible to solve or not (isolated dots, two or more endpoint)
2. Check every possible path by checking every possible move (left right top bottom)
3. A solution is found if the amount of node visited is equal to the amount of usable dots in the board.

### Greedy: Choosing the dot with the most active connectionf first
Time complexity: O(4^n), space complexity O(n), n: amount of cell in the board  
note: Greedy is better than the Brute Force due to informed choices
1. Pre-check if the board is possible to solve or not (isolated dots, two or more endpoint)
2. Make a ordered list of the dots based on their active connection amount
3. Choose the dot with the highest active connection 
4. If failed backtrack to use the dot with the next highest active connection
5. If the length of path the same as the amount of dot possible then a solution is found

### Path Finding: Depth First Search (DFS) --> Main Algorithm
Time complexity: O(V + E), space complexity O(V), V: vertices, E: edge  
1. Board is converted into a graph where each node is a dot and each edge is a connection between two dots.
2. Check if the board is solvable (isolated dots, two or more endpoint)
3. DFS is used to find a path from the starting point to a point in the board.
4. A solution is found if the amount of node visited is equal to the amount of usable dots in the board.

<!-- Bonus  -->
## Bonus

### Solution Animation
- Exist a button to animate the solution found.
  
### Additional algorithm model
- Brute Force and Greedy algorithm

<p align="right">(<a href="#readme-top">back to top</a>)</p>
    
<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Project dependencies  

- Node.js
    ```sh
    https://nodejs.org/en/download/
    ```

- Golang
    ```sh
    https://golang.org/doc/install
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Installation

_How to install and use your project_

1. Clone the repo
   ```sh
   git clone https://github.com/NoHaitch/Dot-Connect-Game
   ```
2. Change directory
   ```sh
    cd Dot-Connect-Game
   ```
3. Install NPM packages
   ```sh
   cd src/frontend
   npm install
   ```
4. Open 2 terminal, one to host the frontend, and the second for the backend
5. In the first terminal, run the frontend
   ```sh
   cd src/frontend
   npm start
   ```
6. In the second terminal, run the backend
   ```sh
    cd src/backend
    go run .
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- INSTURCTION -->
## Instruction

- Run the frontend
   ```sh
   cd src/frontend
   npm start
   ```
- Run the backend
    ```sh
    cd src/backend
    go run .
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

If you want to contribute or further develop the program, please fork this repository using the branch feature.  
Pull Request is **permited and warmly welcomed**

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

The code in this project is licensed under MIT license.


<!-- SPECIAL THANKS AND/OR CREDITS -->
## Special Thanks
- [Repository_Template](https://github.com/NoHaitch/Repository_Template/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<br>
<h3 align="center"> THANK YOU! </h3>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[issues-url]: https://github.com/NoHaitch/Dot-Connect-Game/issues
[license-shield]: https://img.shields.io/badge/License-MIT-yellow
[license-url]: https://github.com/NoHaitch/Dot-Connect-Game/blob/main/LICENSE
