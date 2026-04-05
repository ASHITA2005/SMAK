import fs from 'fs';
import path from 'path';

// Read existing mock data
const apiFile = fs.readFileSync('./frontend/src/services/api.js', 'utf8');

// I will just use dummy data to test the function logic
const recipes = {
  pasta: {
    tasks: {
      p1: { name: "boil_water", duration: 5, resource: "stove" },
      p2: { name: "cook_pasta", duration: 8, resource: "stove" }
    },
    deps: [["p1", "p2"]]
  }
};

const resourceLimits = {
  countertop: 5, grill: 1, stove: 3, toaster: 1, fryer: 2
};

const tasks = {};
const deps = {};
const rev_deps = {};

for (const recipeName in recipes) {
  const recipe = recipes[recipeName];
  for (const taskName in recipe.tasks) {
    const taskId = `${recipeName}_${taskName}`;
    tasks[taskId] = recipe.tasks[taskName];
    deps[taskId] = [];
    rev_deps[taskId] = [];
  }
  recipe.deps.forEach(([t1, t2]) => {
    const t1id = `${recipeName}_${t1}`;
    const t2id = `${recipeName}_${t2}`;
    deps[t1id].push(t2id);
    rev_deps[t2id].push(t1id);
  });
}

const indegree = {};
for (const taskId in tasks) indegree[taskId] = rev_deps[taskId].length;

const longestPath = {};
function dfs(taskId) {
  if (longestPath[taskId] !== undefined) return longestPath[taskId];
  let maxVal = 0;
  if (deps[taskId]) {
    for (const child of deps[taskId]) maxVal = Math.max(maxVal, dfs(child));
  }
  longestPath[taskId] = tasks[taskId].duration + maxVal;
  return longestPath[taskId];
}
for (const taskId in tasks) dfs(taskId);

const resourceAvailable = { ...resourceLimits };
const schedule = {};
let ready = {};
for (const taskId in tasks) if (indegree[taskId] === 0) ready[taskId] = tasks[taskId];

const resourceLayers = {};
Object.keys(resourceLimits).forEach(res => { resourceLayers[res] = []; });

const finishQueue = [];
let currentTime = 0;
let iters = 0;

while (Object.keys(ready).length > 0 || finishQueue.length > 0) {
  iters++;
  if(iters > 100) { console.log("INFINITE LOOP"); break; }
  
  const sortedReady = Object.entries(ready).sort((a, b) => {
    const pathDiff = longestPath[b[0]] - longestPath[a[0]];
    if (pathDiff !== 0) return pathDiff;
    return a[1].duration - b[1].duration;
  });

  const newReady = {};
  let scheduled = false;

  for (const [taskId, task] of sortedReady) {
    if (resourceAvailable[task.resource] > 0) {
      resourceAvailable[task.resource]--;
      const finishTime = currentTime + task.duration;
      finishQueue.push([finishTime, taskId, task]);
      finishQueue.sort((a, b) => a[0] - b[0]);
      
      const layersActive = resourceLayers[task.resource] || [];
      let layerObj = layersActive.find(l => l.endTime <= currentTime);
      let visualLayer = 0;
      if (!layerObj) {
          visualLayer = layersActive.length;
          layerObj = { endTime: finishTime, layerIndex: visualLayer };
          layersActive.push(layerObj);
      } else {
          visualLayer = layerObj.layerIndex;
          layerObj.endTime = finishTime;
      }

      schedule[taskId] = { taskId, start: currentTime, end: finishTime, layer: visualLayer };
      scheduled = true;
    } else {
      newReady[taskId] = task;
    }
  }

  ready = newReady;

  if (!scheduled) {
    if (finishQueue.length === 0) break;
    const nextTime = finishQueue[0][0];
    currentTime = nextTime;
    
    while (finishQueue.length > 0 && finishQueue[0][0] === currentTime) {
       const [fTime, doneTaskId, doneTask] = finishQueue.shift();
       resourceAvailable[doneTask.resource]++;
       for (const child of deps[doneTaskId]) {
         indegree[child]--;
         if (indegree[child] === 0) ready[child] = tasks[child];
       }
    }
  }
}

console.log("SCHEDULE SUCCESS:", Object.keys(schedule).length);
