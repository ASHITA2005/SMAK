def schedule_recipes(recipes: dict, selected_recipe_names: list[str]) -> list[dict]:
    selected = {name: recipes[name] for name in selected_recipe_names if name in recipes}

    tasks: dict[str, dict] = {}
    deps: dict[str, list[str]] = {}
    rev_deps: dict[str, list[str]] = {}

    for recipe_name, recipe in selected.items():
        for task_key, task in recipe["tasks"].items():
            task_id = f"{recipe_name}_{task_key}"
            tasks[task_id] = task
            deps[task_id] = []
            rev_deps[task_id] = []

        for t1, t2 in recipe["deps"]:
            t1id = f"{recipe_name}_{t1}"
            t2id = f"{recipe_name}_{t2}"
            deps[t1id].append(t2id)
            rev_deps[t2id].append(t1id)

    indegree = {task_id: len(rev_deps[task_id]) for task_id in tasks}

    longest_path: dict[str, float] = {}

    def dfs(task_id: str) -> float:
        if task_id in longest_path:
            return longest_path[task_id]
        max_child = 0
        for child in deps.get(task_id, []):
            max_child = max(max_child, dfs(child))
        longest_path[task_id] = float(tasks[task_id]["duration"]) + max_child
        return longest_path[task_id]

    for tid in tasks:
        dfs(tid)

    resource_limits = {"countertop": 5, "grill": 1, "stove": 3, "toaster": 1, "fryer": 2}
    resource_available = dict(resource_limits)
    resource_layers = {k: [] for k in resource_limits.keys()}
    ready = {tid: tasks[tid] for tid, deg in indegree.items() if deg == 0}
    finish_q: list[tuple[float, str, dict]] = []
    schedule: dict[str, dict] = {}
    current_time = 0.0

    while ready or finish_q:
        # Sort by longest path (descending), tie break with shortest duration (ascending)
        sorted_ready = sorted(
            ready.items(),
            key=lambda kv: (-longest_path[kv[0]], float(kv[1]["duration"]))
        )
        new_ready = {}
        scheduled_any = False

        for task_id, task in sorted_ready:
            res = task["resource"]
            if resource_available.get(res, 0) > 0:
                resource_available[res] -= 1
                duration = float(task["duration"])
                finish_time = current_time + duration
                finish_q.append((finish_time, task_id, task))
                finish_q.sort(key=lambda x: x[0])

                # Layout layers allocation
                visual_layer = len(resource_layers[res])
                for idx, layer_end in enumerate(resource_layers[res]):
                    if layer_end <= current_time:
                        visual_layer = idx
                        resource_layers[res][idx] = finish_time
                        break
                else:
                    resource_layers[res].append(finish_time)

                recipe_name, task_key = task_id.split("_", 1)
                schedule[task_id] = {
                    "taskId": task_id,
                    "start": current_time,
                    "end": finish_time,
                    "resource": res,
                    "recipe": recipe_name,
                    "taskKey": task_key,
                    "taskName": task.get("name"),
                    "duration": duration,
                    "layer": visual_layer
                }
                scheduled_any = True
            else:
                new_ready[task_id] = task

        ready = new_ready

        if not scheduled_any:
            if not finish_q:
                break
            
            next_time = finish_q[0][0]
            current_time = next_time
            
            # Flush all tasks concluding at this precise time
            while finish_q and finish_q[0][0] == current_time:
                _, done_task_id, done_task = finish_q.pop(0)
                resource_available[done_task["resource"]] += 1
                for child in deps.get(done_task_id, []):
                    indegree[child] -= 1
                    if indegree[child] == 0:
                        ready[child] = tasks[child]

    return sorted(schedule.values(), key=lambda x: x["start"])

