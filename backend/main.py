from collections import deque
from recipes import recipes
from collections import deque, defaultdict
from threading import Semaphore
import heapq


tasks={}
deps = defaultdict(list)
rev_deps=defaultdict(list)

for recipe_name, info in recipes.items():
    for task_name, guide in info["tasks"].items():
        id = f"{recipe_name}_{task_name}"
        tasks[id]=guide
    for t1, t2 in info["deps"]:
        t1id = f"{recipe_name}_{t1}"
        t2id = f"{recipe_name}_{t2}"
        deps[t1id].append(t2id)
        rev_deps[t2id].append(t1id)

print(tasks)
print()
print(deps)
print()
print(rev_deps)
print()

# indegree
indegree= { task:len(rev_deps[task]) for task in tasks }
print(indegree)
# longest remaining path


def find_longest_path():
    memo = {}
    def dfs(tid):
        if tid in memo:
            return memo[tid]
        val = 0
        if deps[tid]:
            for children in deps[tid]:
                val =  max(val, dfs(children))
        memo[tid] = tasks[tid]['duration'] + val
        return memo[tid]
    for tid in tasks:
        dfs(tid)
    return memo

print("\nLongest remaining path\n")

memo = find_longest_path()
print(memo)
print()
    


                                #list comprehension for creating ready Q
#Resources Initialization
countertop = Semaphore(5)
grill = Semaphore(1)
stove = Semaphore(3)
toaster = Semaphore(1)
fryer = Semaphore(2)
Resources = {"countertop": countertop, "grill": grill, "stove": stove, "toaster": toaster, "fryer": fryer}

# print("--------Resource Test")
# print(Resources["countertop"])
# print()

schedule = {}
ready = {t:tasks[t] for t in indegree if indegree[t] == 0}

# print("Ready")
# print(ready)
# print()

finish_ready = []
time = 0

while ready or finish_ready:
    # sorted_ready = dict(sorted(ready.items(), key = lambda t : -t[1]["duration"]))        #Sorting using immediate duration for now
    sorted_ready = dict(sorted(ready.items(), key = lambda t : -memo[t[0]]))                #Sorting based on longest path remaining

    # print("Sorted Ready")
    # print(sorted_ready)
    # print()

    new_ready = {}
    scheduled = False

    for t in sorted_ready:
        if Resources[sorted_ready[t]["resource"]].acquire(blocking = True):
            heapq.heappush(finish_ready, (time + sorted_ready[t]["duration"], t, sorted_ready[t]))
            schedule[t] = (time, time + sorted_ready[t]["duration"])
            scheduled = True
        else:
            new_ready.append(sorted_ready[t])
    
    # print("finish_ready")
    # print(finish_ready)
    # print()
    
    ready = new_ready

    # print("new_ready")
    # print(new_ready)
    # print()
    
    # print("Schedule")
    # print(schedule)
    # print()

    if not scheduled:
        if not finish_ready:
            break
        next_finish, done_task_name, done_task = heapq.heappop(finish_ready)

        # print("done task")
        # print(done_task)
        # print()

        time = next_finish
        Resources[done_task["resource"]].release()
        
        # Update indegree of dependencies for completed task
        for child in deps[done_task_name]:
            indegree[child] -= 1
            if indegree[child] == 0:
                ready[child] = tasks[child]
    else:
        continue 

    # print("time")
    # print(time)
    # print()

print("Final Schedule")
print(schedule)
print()