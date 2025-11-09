// Scheduling algorithm based on main.py logic

export function scheduleRecipes(recipes, selectedRecipeNames) {
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
  
  // Initialize ready queue with tasks that have no dependencies
  for (const taskId in tasks) {
    if (indegree[taskId] === 0) {
      ready[taskId] = tasks[taskId]
    }
  }

  // Priority queue for finishing tasks: [finishTime, taskId, taskInfo]
  const finishQueue = []
  let currentTime = 0

  while (Object.keys(ready).length > 0 || finishQueue.length > 0) {
    // Sort ready tasks by longest remaining path (priority) - descending order
    const sortedReady = Object.entries(ready)
      .sort((a, b) => longestPath[b[0]] - longestPath[a[0]])

    const newReady = {}
    let scheduled = false

    // Try to schedule ready tasks
    for (const [taskId, task] of sortedReady) {
      if (resourceAvailable[task.resource] > 0) {
        // Resource available, schedule the task
        resourceAvailable[task.resource]--
        const finishTime = currentTime + task.duration
        
        // Add to finish queue (maintained as min-heap by sorting)
        finishQueue.push([finishTime, taskId, task])
        finishQueue.sort((a, b) => a[0] - b[0])
        
        const [recipeName, taskKey] = taskId.split('_')
        schedule[taskId] = {
          taskId: taskId,
          start: currentTime,
          end: finishTime,
          resource: task.resource,
          recipe: recipeName,
          taskKey: taskKey,
          taskName: task.name,
          duration: task.duration
        }
        scheduled = true
      } else {
        // Resource not available, keep in ready queue
        newReady[taskId] = task
      }
    }

    ready = newReady

    // If nothing was scheduled, advance time to next task completion
    if (!scheduled) {
      if (finishQueue.length === 0) {
        break
      }

      const [finishTime, doneTaskId, doneTask] = finishQueue.shift()
      currentTime = finishTime
      
      // Release resource
      resourceAvailable[doneTask.resource]++

      // Update indegree of children (tasks that this task enables)
      for (const child of deps[doneTaskId]) {
        indegree[child]--
        if (indegree[child] === 0) {
          ready[child] = tasks[child]
        }
      }
    }
    // If scheduled, continue to next iteration to try scheduling more tasks
  }

  // Convert schedule object to array
  return Object.values(schedule).sort((a, b) => a.start - b.start)
}
