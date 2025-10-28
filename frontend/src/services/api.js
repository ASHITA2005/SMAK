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
        t1: { name: "form_patties", duration: 2, involvement_time: 1, resource: "countertop" },
        t2: { name: "grill_patties", duration: 6, resource: "grill" },
        t3: { name: "toast_buns", duration: 1, resource: "toaster" },
        t4: { name: "assemble", duration: 1, resource: "countertop" }
      },
      deps: [["t1", "t2"], ["t3", "t4"], ["t2", "t4"]]
    },
    fries: {
      tasks: {
        f1: { name: "cut_potatoes", duration: 2, resource: "countertop" },
        f2: { name: "fry_potatoes", duration: 4, resource: "fryer" },
        f3: { name: "salt_fries", duration: 1, resource: "countertop" }
      },
      deps: [["f1", "f2"], ["f2", "f3"]]
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

