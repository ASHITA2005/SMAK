import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  getRecipes: () => api.get('/recipes'),
  getRecipe: (recipeName) => api.get(`/recipes/${recipeName}`),
  getSchedule: () => api.get('/schedule'),
  getResources: () => api.get('/resources'),
  
  // Mock data for development
  getMockRecipes: () => ({
    burger: {
      tasks: {
        t1: { name: "form_patties", duration: 2, involvement_time: 2, resource: "countertop" },
        t2: { name: "grill_patties", duration: 6, involvement_time: 2, resource: "grill" },
        t3: { name: "toast_buns", duration: 1, involvement_time: 1, resource: "toaster" },
        t4: { name: "assemble", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["t1", "t2"], ["t3", "t4"], ["t2", "t4"]],
      ingredients: [
        { item: "Beef Patty", amount: 2, unit: "pcs" },
        { item: "Burger Buns", amount: 2, unit: "pcs" },
        { item: "Cheese", amount: 2, unit: "slices" },
        { item: "Lettuce", amount: 1, unit: "head" }
      ]
    },
    fries: {
      tasks: {
        f1: { name: "cut_potatoes", duration: 2, involvement_time: 2, resource: "countertop" },
        f2: { name: "fry_potatoes", duration: 4, involvement_time: 1, resource: "fryer" },
        f3: { name: "salt_fries", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["f1", "f2"], ["f2", "f3"]],
      ingredients: [
        { item: "Potatoes", amount: 4, unit: "lbs" },
        { item: "Salt", amount: 1, unit: "tbsp" },
        { item: "Frying Oil", amount: 1, unit: "liter" }
      ]
    },
    pasta: {
      tasks: {
        p1: { name: "boil_water", duration: 5, involvement_time: 0.5, resource: "stove" },
        p2: { name: "cook_pasta", duration: 8, involvement_time: 1, resource: "stove" },
        p3: { name: "prepare_sauce", duration: 3, involvement_time: 3, resource: "countertop" },
        p4: { name: "combine", duration: 2, involvement_time: 2, resource: "countertop" }
      },
      deps: [["p1", "p2"], ["p3", "p4"], ["p2", "p4"]],
      ingredients: [
        { item: "Pasta", amount: 1, unit: "lb" },
        { item: "Tomato Sauce", amount: 2, unit: "cups" },
        { item: "Garlic", amount: 3, unit: "cloves" },
        { item: "Parmesan", amount: 0.5, unit: "cups" }
      ]
    },
    salad: {
      tasks: {
        s1: { name: "wash_vegetables", duration: 2, involvement_time: 2, resource: "countertop" },
        s2: { name: "chop_vegetables", duration: 3, involvement_time: 3, resource: "countertop" },
        s3: { name: "mix_dressing", duration: 1, involvement_time: 1, resource: "countertop" },
        s4: { name: "toss_salad", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["s1", "s2"], ["s2", "s4"], ["s3", "s4"]],
      ingredients: [
        { item: "Lettuce", amount: 1, unit: "head" },
        { item: "Tomatoes", amount: 2, unit: "pcs" },
        { item: "Cucumber", amount: 1, unit: "pcs" },
        { item: "Balsamic Vinaigrette", amount: 0.25, unit: "cups" }
      ]
    },
    chicken: {
      tasks: {
        c1: { name: "marinate", duration: 2, involvement_time: 1, resource: "countertop" },
        c2: { name: "grill_chicken", duration: 10, involvement_time: 2, resource: "grill" },
        c3: { name: "prepare_sides", duration: 4, involvement_time: 3, resource: "countertop" },
        c4: { name: "plate", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["c1", "c2"], ["c2", "c4"], ["c3", "c4"]],
      ingredients: [
        { item: "Chicken Breast", amount: 2, unit: "lbs" },
        { item: "Marinade", amount: 1, unit: "cup" },
        { item: "Asparagus", amount: 1, unit: "bunch" }
      ]
    },
    soup: {
      tasks: {
        sp1: { name: "chop_vegetables", duration: 3, involvement_time: 3, resource: "countertop" },
        sp2: { name: "saute", duration: 4, involvement_time: 2, resource: "stove" },
        sp3: { name: "simmer", duration: 12, involvement_time: 0.5, resource: "stove" },
        sp4: { name: "season", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["sp1", "sp2"], ["sp2", "sp3"], ["sp3", "sp4"]],
      ingredients: [
        { item: "Onions", amount: 2, unit: "pcs" },
        { item: "Carrots", amount: 3, unit: "pcs" },
        { item: "Broth", amount: 4, unit: "cups" },
        { item: "Garlic", amount: 2, unit: "cloves" }
      ]
    },
    sandwich: {
      tasks: {
        sw1: { name: "slice_bread", duration: 1, involvement_time: 1, resource: "countertop" },
        sw2: { name: "prepare_fillings", duration: 3, involvement_time: 3, resource: "countertop" },
        sw3: { name: "toast_bread", duration: 2, involvement_time: 1, resource: "toaster" },
        sw4: { name: "assemble", duration: 2, involvement_time: 2, resource: "countertop" }
      },
      deps: [["sw1", "sw4"], ["sw2", "sw4"], ["sw3", "sw4"]],
      ingredients: [
        { item: "Bread", amount: 2, unit: "slices" },
        { item: "Turkey", amount: 4, unit: "slices" },
        { item: "Cheese", amount: 1, unit: "slices" },
        { item: "Mayonnaise", amount: 1, unit: "tbsp" }
      ]
    },
    pizza: {
      tasks: {
        z1: { name: "make_dough", duration: 3, involvement_time: 3, resource: "countertop" },
        z2: { name: "prepare_toppings", duration: 4, involvement_time: 3, resource: "countertop" },
        z3: { name: "bake_pizza", duration: 8, involvement_time: 1, resource: "grill" },
        z4: { name: "slice_pizza", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["z1", "z3"], ["z2", "z3"], ["z3", "z4"]],
      ingredients: [
        { item: "Pizza Dough", amount: 1, unit: "ball" },
        { item: "Tomato Sauce", amount: 0.5, unit: "cups" },
        { item: "Mozzarella", amount: 2, unit: "cups" },
        { item: "Pepperoni", amount: 15, unit: "slices" }
      ]
    },
    tacos: {
      tasks: {
        tc1: { name: "cook_meat", duration: 5, involvement_time: 2, resource: "stove" },
        tc2: { name: "prepare_veggies", duration: 3, involvement_time: 3, resource: "countertop" },
        tc3: { name: "warm_tortillas", duration: 2, involvement_time: 1, resource: "stove" },
        tc4: { name: "assemble_tacos", duration: 2, involvement_time: 2, resource: "countertop" }
      },
      deps: [["tc1", "tc4"], ["tc2", "tc4"], ["tc3", "tc4"]],
      ingredients: [
        { item: "Ground Beef", amount: 1, unit: "lb" },
        { item: "Tortillas", amount: 6, unit: "pcs" },
        { item: "Lettuce", amount: 0.5, unit: "head" },
        { item: "Cheese", amount: 1, unit: "cups" }
      ]
    },
    rice_bowl: {
      tasks: {
        r1: { name: "cook_rice", duration: 10, involvement_time: 1, resource: "stove" },
        r2: { name: "prepare_protein", duration: 6, involvement_time: 3, resource: "grill" },
        r3: { name: "chop_vegetables", duration: 3, involvement_time: 3, resource: "countertop" },
        r4: { name: "assemble_bowl", duration: 2, involvement_time: 2, resource: "countertop" }
      },
      deps: [["r1", "r4"], ["r2", "r4"], ["r3", "r4"]],
      ingredients: [
        { item: "Rice", amount: 2, unit: "cups" },
        { item: "Chicken Breast", amount: 1, unit: "lbs" },
        { item: "Broccoli", amount: 1, unit: "head" },
        { item: "Soy Sauce", amount: 2, unit: "tbsp" }
      ]
    },
    stir_fry: {
      tasks: {
        sf1: { name: "slice_vegetables", duration: 4, involvement_time: 4, resource: "countertop" },
        sf2: { name: "prepare_sauce", duration: 2, involvement_time: 2, resource: "countertop" },
        sf3: { name: "stir_fry", duration: 5, involvement_time: 3, resource: "stove" },
        sf4: { name: "serve", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["sf1", "sf3"], ["sf2", "sf3"], ["sf3", "sf4"]],
      ingredients: [
        { item: "Mixed Vegetables", amount: 3, unit: "cups" },
        { item: "Soy Sauce", amount: 3, unit: "tbsp" },
        { item: "Ginger", amount: 1, unit: "tbsp" },
        { item: "Garlic", amount: 2, unit: "cloves" }
      ]
    },
    nachos: {
      tasks: {
        n1: { name: "grate_cheese", duration: 2, involvement_time: 2, resource: "countertop" },
        n2: { name: "prepare_toppings", duration: 3, involvement_time: 3, resource: "countertop" },
        n3: { name: "bake_nachos", duration: 4, involvement_time: 1, resource: "grill" },
        n4: { name: "add_toppings", duration: 1, involvement_time: 1, resource: "countertop" }
      },
      deps: [["n1", "n3"], ["n2", "n4"], ["n3", "n4"]],
      ingredients: [
        { item: "Tortilla Chips", amount: 1, unit: "bag" },
        { item: "Cheese", amount: 3, unit: "cups" },
        { item: "Jalapenos", amount: 0.5, unit: "cups" },
        { item: "Sour Cream", amount: 0.5, unit: "cups" }
      ]
    }
  }),
  
  getMockResources: () => ({
    countertop: { total: 5, available: 3 },
    grill: { total: 1, available: 0 },
    stove: { total: 3, available: 2 },
    toaster: { total: 1, available: 1 },
    fryer: { total: 2, available: 1 }
  })
}

