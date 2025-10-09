from collections import deque
from recipes import recipes
from collections import deque, defaultdict
from threading import Semaphore
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

        

        
        
#Resources Initialization
countertop = Semaphore(5)
grill = Semaphore(1)
stove = Semaphore(3)
toaster = Semaphore(1)
fryer = Semaphore(2)

def RecipeScheduler():
    while ready or finish_ready:
        sorted_ready = sorted(ready, )
        new_ready = deque()
        scheduled = False

        for t in sorted_ready:
            if t["resource"]

