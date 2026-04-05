// Scheduling algorithm based on main.py logic

export function scheduleRecipes(recipes, selectedRecipeNames, chefs = []) {
  if (chefs.length === 0) chefs = ["Default Chef"]
  // Filter recipes to only selected ones
  const selectedRecipes = {}
  selectedRecipeNames.forEach(name => {
    if (recipes[name]) {
      selectedRecipes[name] = recipes[name]
    }
  })

  // Build task graph
  const tasks = {}
  const deps = {}
  const rev_deps = {}

  for (const recipeName in selectedRecipes) {
    const recipe = selectedRecipes[recipeName]
    
    // Add tasks with prefixed IDs
    for (const taskName in recipe.tasks) {
      const taskId = `${recipeName}_${taskName}`
      tasks[taskId] = recipe.tasks[taskName]
      deps[taskId] = []
      rev_deps[taskId] = []
    }

    // Add dependencies: t1 -> t2 means t1 enables t2 (t2 depends on t1)
    recipe.deps.forEach(([t1, t2]) => {
      const t1id = `${recipeName}_${t1}`
      const t2id = `${recipeName}_${t2}`
      deps[t1id].push(t2id)  // t1 enables t2
      rev_deps[t2id].push(t1id)  // t2 has prerequisite t1
    })
  }

  // Calculate indegree (number of prerequisites)
  const indegree = {}
  for (const taskId in tasks) {
    indegree[taskId] = rev_deps[taskId].length
  }

  // Find longest path (critical path) - longest remaining time
  const longestPath = {}
  function dfs(taskId) {
    if (longestPath[taskId] !== undefined) {
      return longestPath[taskId]
    }
    let maxVal = 0
    // Check children (tasks this task enables)
    if (deps[taskId] && deps[taskId].length > 0) {
      for (const child of deps[taskId]) {
        maxVal = Math.max(maxVal, dfs(child))
      }
    }
    longestPath[taskId] = tasks[taskId].duration + maxVal
    return longestPath[taskId]
  }

  for (const taskId in tasks) {
    dfs(taskId)
  }

  // Resource limits
  const resourceLimits = {
    countertop: 5,
    grill: 1,
    stove: 3,
    toaster: 1,
    fryer: 2
  }

  // Resource availability tracking
  const resourceAvailable = { ...resourceLimits }

  // Schedule
  const schedule = {}
  let ready = {}

  // Layer tracking per resource
  const resourceLayers = {}
  Object.keys(resourceLimits).forEach(res => { resourceLayers[res] = [] })

  // Initialize ready queue with tasks that have no dependencies
  for (const taskId in tasks) {
    if (indegree[taskId] === 0) {
      ready[taskId] = tasks[taskId]
    }
  }

  // Priority queue for finishing tasks: [finishTime, taskId, taskInfo]
  const finishQueue = []
  let currentTime = 0
  let chefIndex = 0

  while (Object.keys(ready).length > 0 || finishQueue.length > 0) {
    // Sort ready tasks by longest remaining path (descending)
    // Secondary sort: Shortest duration task first if paths are tied
    const sortedReady = Object.entries(ready)
      .sort((a, b) => {
        const pathDiff = longestPath[b[0]] - longestPath[a[0]]
        if (pathDiff !== 0) return pathDiff
        return a[1].duration - b[1].duration
      })

    const newReady = {}
    let scheduled = false

    // Try to schedule ready tasks
    for (const [taskId, task] of sortedReady) {
      if (resourceAvailable[task.resource] > 0) {
        resourceAvailable[task.resource]--
        const finishTime = currentTime + task.duration
        
        finishQueue.push([finishTime, taskId, task])
        finishQueue.sort((a, b) => a[0] - b[0])
        
        // Calculate visual Gantt Layer safely
        const layersActive = resourceLayers[task.resource]
        let layerObj = layersActive.find(l => l.endTime <= currentTime)
        let visualLayer = 0
        if (!layerObj) {
            visualLayer = layersActive.length
            layerObj = { endTime: finishTime, layerIndex: visualLayer }
            layersActive.push(layerObj)
        } else {
            visualLayer = layerObj.layerIndex
            layerObj.endTime = finishTime
        }

        const [recipeName, taskKey] = taskId.split('_')
        schedule[taskId] = {
          taskId: taskId,
          start: currentTime,
          end: finishTime,
          resource: task.resource,
          recipe: recipeName,
          taskKey: taskKey,
          taskName: task.name,
          duration: task.duration,
          layer: visualLayer,
          chef: chefs[chefIndex % chefs.length]
        }
        chefIndex++;
        scheduled = true
      } else {
        newReady[taskId] = task
      }
    }

    ready = newReady

    // Advance time strictly when nothing could be mapped
    if (!scheduled) {
      if (finishQueue.length === 0) break
      
      const nextTime = finishQueue[0][0]
      currentTime = nextTime
      
      // Pop all tasks finishing at this exact nextTime
      while (finishQueue.length > 0 && finishQueue[0][0] === currentTime) {
         const [finishTime, doneTaskId, doneTask] = finishQueue.shift()
         resourceAvailable[doneTask.resource]++
         
         for (const child of deps[doneTaskId]) {
           indegree[child]--
           if (indegree[child] === 0) {
             ready[child] = tasks[child]
           }
         }
      }
    }
  }

  // Convert schedule object to array
  return Object.values(schedule).sort((a, b) => a.start - b.start)
}
