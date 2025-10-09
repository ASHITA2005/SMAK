from collections import deque
from recipes import recipes
from threading import Semaphore

for name in recipes:
    print(name)

#Resources Initialization
countertop = Semaphore(5)
grill = Semaphore(1)
stove = Semaphore(3)
toaster = Semaphore(1)
fryer = Semaphore(2)


while ready or finish_ready:
    sorted_ready = sorted(ready, )
    new_ready = deque()
    scheduled = False

    for t in sorted_ready:
        if t["resource"]

