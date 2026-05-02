export class Project {
  constructor({ name, company, budget, capacity }) {
    this.id = crypto.randomUUID();
    this.projectName = name;
    this.companyName = company;
    this.budget = budget;
    this.employeeCapacity = capacity;
    this.employees = [];
  }
}

export class Employee {
  constructor({
    name,
    surname,
    dob,
    position,
    salary,
    assignments = [],
    vacationDays,
  }) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.surname = surname;
    this.age = this.getAge(dob);
    this.position = position;
    this.salary = salary;
    this.assignments = assignments;
    this.vacationDays = vacationDays;
  }

  getAge(dob) {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}

class ManagerStore {
  constructor() {
    this.data = JSON.parse(localStorage.getItem("monthlyData")) || {};
  }

  addProject(key, project) {
    const store = this.data;
    if (!store[key]) {
      store[key] = {};
      store[key].projects = [];
      store[key].employees = [];
    }

    store[key].projects.push(project);
    this.saveStore();
  }

  saveStore() {
    localStorage.setItem("monthlyData", JSON.stringify(this.data));
  }

  deleteProject(key, id) {
    const date = this.data[key];

    if (!date) return;

    date.projects = date.projects.filter((project) => project.id !== id);

    const employees = date.employees;

    employees.forEach((employee) => {
      if (
        employee.assignments.find((assign, index) => assign.idProject === id)
      ) {
        employee.assignments = employee.assignments.filter(
          (assign) => assign.idProject !== id,
        );
      }
    });

    if (date.projects.length === 0 && date.employees.length === 0) {
      delete this.data[key];
    }

    this.saveStore();
  }

  addEmployee(key, employee) {
    const store = this.data;
    if (!store[key]) {
      store[key] = {};
      store[key].employees = [];
      store[key].projects = [];
    }

    store[key].employees.push(employee);
    this.saveStore();
  }

  deleteEmployee(key, id) {
    const date = this.data[key];

    if (!date) return;

    date.employees = date.employees.filter((employee) => employee.id !== id);

    if (date.projects.length === 0 && date.employees.length === 0) {
      delete this.data[key];
    }

    this.saveStore();
  }

  assignToProject(employee, IdProject, capacity, fit) {
    employee.assignments.push({
      idProject: IdProject,
      capacity: capacity,
      fit: fit,
    });

    this.saveStore();
  }

  editAssign(employee, IdProject, capacity, fit) {
    const targetAssign = employee.assignments.find(
      (item) => item.idProject === IdProject,
    );

    targetAssign.capacity = capacity;
    targetAssign.fit = fit;

    this.saveStore();
  }

  unAssign(idEmployee, idProject, key) {
    const date = this.data[key];

    const employee = date.employees.find((item) => item.id === idEmployee);

    employee.assignments = employee.assignments.filter(
      (assign) => assign.idProject !== idProject,
    );

    this.saveStore();
  }

  copyMonthData(prevKey, currentKey) {
    const store = this.data;
    if (!store[currentKey]) {
      store[currentKey] = {};
      store[currentKey].projects = [];
      store[currentKey].employees = [];
    }

    const copyPrevProjects = structuredClone(store[prevKey].projects);

    const projectsId = new Map();

    copyPrevProjects.forEach((project) => {
      const newId = crypto.randomUUID();

      projectsId.set(project.id, newId);
      project.id = newId;
    });

    const copyPrevEmployees = structuredClone(store[prevKey].employees);

    copyPrevEmployees.forEach((employee) => {
      employee.id = crypto.randomUUID();

      if (employee.assignments) {
        employee.assignments.forEach((assign) => {
          assign.idProject = projectsId.get(assign.idProject);
        });
      }

      if (employee.vacations) {
        delete employee.vacations;
      }
    });

    const currentDateProjects = store[currentKey].projects;
    const currentDateEmployees = store[currentKey].employees;

    currentDateProjects.push(...copyPrevProjects);
    currentDateEmployees.push(...copyPrevEmployees);

    this.saveStore();
  }

  addVacations(date, idEmployee, days) {
    const store = this.data;
    const employee = store[date].employees.find((emp) => emp.id === idEmployee);
    if (!employee.vacations) {
      employee.vacations = [];
    }

    employee.vacations = [...days];
    this.saveStore();
  }

  editProperty(idEmployee, property, value, date) {
    const store = this.data;
    const employee = store[date].employees.find((emp) => emp.id === idEmployee);
    employee[property] = value;
    this.saveStore();
  }
}

export const store = new ManagerStore();
