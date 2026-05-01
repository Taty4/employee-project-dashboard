import { getDate } from "./action.js";
import { getCurrentProjectCapasity } from "./action.js";
import { store } from "./state.js";
import { calculateBudgetEmployee } from "./action.js";
import { calculateBudgetProject } from "./action.js";
import { calculationOfCapacity } from "./action.js";
import { getWorkingDays } from "./action.js";
import { calculateEffectiveСapacity } from "./action.js";

let totalIncome = 0;
let benchPayment = 0;

export function updateUIProjects(projects) {
  const tableProjectsBody = document.querySelector(".tbody-projects");
  if (projects.length === 0) {
    tableProjectsBody.replaceChildren();
    return;
  }

  tableProjectsBody.replaceChildren();

  projects.forEach((project) => {
    const data = calculateBudgetProject(project, getDate());

    const newStroke = document.createElement("tr");
    for (let i = 0; i < 7; i++) {
      const newCell = document.createElement("td");
      if (i === 0) {
        newCell.textContent = `${project.companyName}`;
      } else if (i === 1) {
        newCell.textContent = `${project.projectName}`;
      } else if (i === 2) {
        newCell.textContent = `$${project.budget}`;
      } else if (i === 3) {
        newCell.textContent = `${getCurrentProjectCapasity(project.id).toFixed(2)} / ${project.employeeCapacity}`;
      } else if (i === 4) {
        if (data.hasEmployees) {
          const btnShowEmp = document.createElement("button");
          btnShowEmp.className = "btn-action btn-show-emp";
          btnShowEmp.dataset.id = project.id;
          btnShowEmp.textContent = "Show Emploeyees";
          newCell.append(btnShowEmp);
        }
      } else if (i === 5) {
        if (data.projectIncome < 0) {
          newCell.className = "negative-value";
        } else {
          newCell.className = "positive-value";
        }
        newCell.textContent = `$${data.projectIncome.toFixed(2)}`;
      } else if (i === 6) {
        const btnDelete = document.createElement("button");
        btnDelete.className = "btn-action btn-delete";
        btnDelete.dataset.id = project.id;
        btnDelete.textContent = "Delete";
        newCell.append(btnDelete);
      }
      newStroke.append(newCell);
    }
    tableProjectsBody.append(newStroke);
  });
}

const positions = ["Junior", "Middle", "Senior", "Lead", "Architect", "BO"];

export function updateUIEmployees(employees) {
  const tableEmployeesBody = document.querySelector(".tbody-employees");

  if (employees.length === 0) {
    tableEmployeesBody.replaceChildren();
    return;
  }

  tableEmployeesBody.replaceChildren();

  totalIncome = 0;
  benchPayment = 0;
  employees.forEach((employee) => {
    const newStroke = document.createElement("tr");

    const data = calculateBudgetEmployee(employee);
    let currentCapacity = 0;
    employee.assignments.forEach((item) => (currentCapacity += +item.capacity));

    benchPayment += data.benchPayment;
    totalIncome += data.projectedIncome;
    for (let i = 0; i < 9; i++) {
      const newCell = document.createElement("td");

      if (i === 0) {
        newCell.textContent = `${employee.name}`;
      } else if (i === 1) {
        newCell.textContent = `${employee.surname}`;
      } else if (i === 2) {
        newCell.textContent = `${employee.age}`;
      } else if (i === 3) {
        newCell.className = "editable-position";
        newCell.dataset.field = "position";
        newCell.dataset.idEmployee = employee.id;
        const span = document.createElement("span");
        span.className = "span-txt-cell";
        span.textContent = `${employee.position}`;
        const select = document.createElement("select");
        select.className = "form-edit";
        for (let i = 0; i < positions.length; i++) {
          const option = document.createElement("option");
          option.textContent = positions[i];
          option.value = positions[i];
          if (positions[i] === employee.position) {
            option.selected = true;
          }
          select.append(option);
        }
        newCell.append(span, select);
      } else if (i === 4) {
        newCell.className = "editable-salary";
        newCell.dataset.field = "salary";
        newCell.dataset.idEmployee = employee.id;
        const span = document.createElement("span");
        span.className = "span-txt-cell";
        span.textContent = `$${employee.salary}`;
        const input = document.createElement("input");
        input.className = "form-edit";
        input.type = "number";
        input.min = "0.01";
        input.step = "0.01";
        input.value = employee.salary;

        newCell.append(span, input);
      } else if (i === 5) {
        newCell.textContent = `$${data.estimatedPayment.toFixed(2)}`;
      } else if (i === 6 && employee.assignments.length !== 0) {
        const btnShowAssignments = document.createElement("button");
        btnShowAssignments.dataset.id = employee.id;
        btnShowAssignments.className = "btn-action btn-show-assign";
        btnShowAssignments.textContent = "Show Assignments";

        newCell.append(btnShowAssignments);
      } else if (i === 7) {
        if (data.projectedIncome < 0) {
          newCell.className = "negative-value";
        } else {
          newCell.className = "positive-value";
        }
        newCell.textContent = `$${data.projectedIncome.toFixed(2)}`;
      } else if (i === 8) {
        const btnDelete = document.createElement("button");
        btnDelete.className = "btn-action btn-delete";
        btnDelete.dataset.id = employee.id;
        btnDelete.textContent = "Delete";

        const btnAssign = document.createElement("button");
        btnAssign.className = "btn-action btn-assign";
        btnAssign.dataset.id = employee.id;
        btnAssign.textContent = "Assign";
        btnAssign.disabled = currentCapacity >= 1.5;

        const btnAvailability = document.createElement("button");
        btnAvailability.className = "btn-action btn-availability";
        btnAvailability.dataset.idEmployee = employee.id;
        btnAvailability.textContent = "Availability";

        newCell.append(btnAvailability);
        newCell.append(btnAssign);
        newCell.append(btnDelete);
      }

      newStroke.append(newCell);
    }
    tableEmployeesBody.append(newStroke);
  });
}

export function updateUIModalAssign(employee) {
  const assignModalHeaderSpan = document.querySelector(".modal-header-span");
  assignModalHeaderSpan.textContent = `${employee.name} ${employee.surname}`;

  const selectProject = document.getElementById("select-project");
  selectProject.replaceChildren();

  // Капасите от всех назначений
  let currentCapacity = 0; /* Все капасити по работнику */
  employee.assignments.forEach((item) => (currentCapacity += +item.capacity));

  document.querySelector(".other-projects-capacity-value").textContent =
    `${currentCapacity.toFixed(2)}`;

  document.querySelector(".avialable-capasity-value").textContent =
    `${(1.5 - currentCapacity).toFixed(2)}`;

  const projects = store.data[getDate()].projects;
  const option = document.createElement("option");
  option.textContent = "Select Project";
  option.value = "";
  selectProject.append(option);
  if (projects.length !== 0) {
    for (let i = 0; i < projects.length; i++) {
      const option = document.createElement("option");
      option.textContent = projects[i].projectName;
      option.value = projects[i].id;
      selectProject.append(option);
    }
  }
}

export function updateShowAssignModal(employee, modal) {
  modal.querySelector(".show-modal-header-span").textContent =
    `${employee.name} ${employee.surname}`;
  const tbody = modal.querySelector(".tbody-show-assigments");
  tbody.replaceChildren();

  if (employee.assignments.length === 0 || !employee.assignments) {
    modal.querySelector(".no-assigments").classList.add("open");
    return;
  }

  modal.querySelector(".no-assigments").classList.remove("open");

  employee.assignments.forEach((assign) => {
    const idProject = assign.idProject;

    const project = store.data[getDate()]?.projects?.find(
      (item) => item.id === idProject,
    );

    const workigDays = getWorkingDays();
    let vacationWorkingDays = 0;

    if (employee.vacations) {
      vacationWorkingDays = employee.vacations.length;
    }
    const vacationCoefficient = (workigDays - vacationWorkingDays) / workigDays;

    const revenue =
      (project.budget / project.employeeCapacity) *
      assign.capacity *
      assign.fit *
      vacationCoefficient;

    const cost = employee.salary * Math.max(0.5, assign.capacity);

    const profit = revenue - cost;

    const tr = document.createElement("tr");
    for (let i = 0; i < 9; i++) {
      const td = document.createElement("td");
      if (i === 0) {
        td.textContent = `${project.projectName}`;
      } else if (i === 1) {
        td.textContent = `${assign.capacity}`;
      } else if (i === 2) {
        td.textContent = `${assign.fit}`;
      } else if (i === 3) {
        td.textContent = `${vacationWorkingDays} days`;
      } else if (i === 4) {
        td.textContent = `${(assign.capacity * assign.fit * vacationCoefficient).toFixed(2)}`;
      } else if (i === 5) {
        td.textContent = `$${revenue.toFixed(2)}`;
      } else if (i === 6) {
        td.textContent = `$${cost.toFixed(2)}`;
      } else if (i === 7) {
        td.textContent = `$${profit.toFixed(2)}`;
      } else if (i === 8) {
        const btnEdit = document.createElement("button");
        btnEdit.className = "btn-action btn-edit-assign";
        btnEdit.dataset.idEmployee = employee.id;
        btnEdit.dataset.idProject = project.id;
        btnEdit.textContent = "Edit";

        const btnUnAssign = document.createElement("button");
        btnUnAssign.className = "btn-action btn-unassign";
        btnUnAssign.dataset.idEmployee = employee.id;
        btnUnAssign.dataset.idProject = project.id;
        btnUnAssign.textContent = "Unassign";

        td.append(btnEdit);
        td.append(btnUnAssign);
      }

      tr.append(td);
    }
    tbody.append(tr);
  });
}

export function updateShowEmpModal(project, modal) {
  modal.querySelector(".show-modal-header-span").textContent =
    `${project.projectName}`;
  const tbody = modal.querySelector(".tbody-show-emp");
  tbody.replaceChildren();
  const employees = store.data[getDate()]?.employees;

  if (
    !employees.some((employee) =>
      employee.assignments.some((assign) => assign.idProject === project.id),
    )
  ) {
    modal.querySelector(".no-assigments").classList.add("open");
    return;
  }

  modal.querySelector(".no-assigments").classList.remove("open");

  employees.forEach((employee) => {
    if (
      employee.assignments.find((assign) => assign.idProject === project.id)
    ) {
      const assign = employee.assignments.find(
        (assign) => assign.idProject === project.id,
      );

      const workigDays = getWorkingDays();

      let vacationWorkingDays = 0;

      if (employee.vacations) {
        vacationWorkingDays = employee.vacations.length;
      }
      const vacationCoefficient =
        (workigDays - vacationWorkingDays) / workigDays;

      const effectiveCapacity = calculateEffectiveСapacity(
        assign.capacity,
        assign.fit,
        employee,
      );

      const revenue =
        (project.budget / project.employeeCapacity) * effectiveCapacity;

      const cost = employee.salary * Math.max(0.5, assign.capacity);
      const profit = revenue - cost;
      const tr = document.createElement("tr");
      for (let i = 0; i < 9; i++) {
        const td = document.createElement("td");
        if (i === 0) {
          td.textContent = `${employee.name} ${employee.surname}`;
        } else if (i === 1) {
          td.textContent = `${assign.capacity}`;
        } else if (i === 2) {
          td.textContent = `${assign.fit}`;
        } else if (i === 3) {
          td.textContent = `${vacationWorkingDays} days`;
        } else if (i === 4) {
          td.textContent = `${effectiveCapacity.toFixed(2)}`;
        } else if (i === 5) {
          td.textContent = `$${revenue.toFixed(2)}`;
        } else if (i === 6) {
          td.textContent = `$${cost.toFixed()}`;
        } else if (i === 7) {
          td.textContent = `$${profit.toFixed(2)}`;
        } else if (i === 8) {
          const btnEdit = document.createElement("button");
          btnEdit.className = "btn-action btn-edit-assign";
          btnEdit.dataset.idEmployee = employee.id;
          btnEdit.dataset.idProject = project.id;
          btnEdit.textContent = "Edit";

          const btnUnAssign = document.createElement("button");
          btnUnAssign.className = "btn-action btn-unassign";
          btnUnAssign.dataset.idEmployee = employee.id;
          btnUnAssign.dataset.idProject = project.id;
          btnUnAssign.textContent = "Unassign";

          td.append(btnEdit);
          td.append(btnUnAssign);
        }

        tr.append(td);
      }
      tbody.append(tr);
    }
  });
}

export function updateModalEditAssign(employee, project, modal) {
  modal.querySelector(".show-modal-header-span").textContent =
    `${employee.name} ${employee.surname} on ${project.projectName}`;

  const capacity = calculationOfCapacity(employee, project.id);
  console.log(capacity.currentCapacityEmployee);
  modal.querySelector(".other-projects-capacity-value").textContent =
    `${(1.5 - +capacity.availableForSelectionCapacity).toFixed(2)}`;

  modal.querySelector(".avialable-capasity-value").textContent =
    `${capacity.availableForSelectionCapacity}`;
}

export function updateTotalStatistic() {
  const cardTotalIncome = document.querySelector(
    ".card-statistic-total-income-span",
  );

  const cardTotalBudget = document.querySelector(
    ".card-statistic-total-budget-span",
  );
  const cardTotalProjects = document.querySelector(
    ".card-statistic-total-projects-span",
  );
  const cardTotalEmployees = document.querySelector(
    ".card-statistic-total-employees-span",
  );

  let totalProjects = 0;
  let totalEmployees = 0;

  if (store.data[getDate()]) {
    totalProjects = store.data[getDate()].projects.length;
    totalEmployees = store.data[getDate()].employees.length;
  } else {
    totalIncome = 0;
  }

  if (totalIncome < 0) {
    cardTotalIncome.classList.add("negative-value");
    cardTotalIncome.classList.remove("positive-value");
  } else if (totalIncome > 0) {
    cardTotalIncome.classList.remove("negative-value");
    cardTotalIncome.classList.add("positive-value");
  } else {
    cardTotalIncome.classList.remove("positive-value");
    cardTotalIncome.classList.remove("negative-value");
  }

  cardTotalIncome.textContent = `$${totalIncome.toFixed(2)}`;
  cardTotalProjects.textContent = `${totalProjects}`;
  cardTotalEmployees.textContent = `${totalEmployees}`;
  document.querySelector(".bench-payment-span").textContent =
    `(Bench payment $${benchPayment.toFixed(2)})`;
}

// Modal unAssign

export function updateModalUnAssign(employee, project, modal) {
  modal.querySelector(".unassign-name-txt-span").textContent =
    `${employee.name} ${employee.surname}`;

  modal.querySelector(".unassign-project-txt-span").textContent =
    `${project.projectName}`;

  const assign = employee.assignments.find(
    (assign) => assign.idProject === project.id,
  );

  const employeePayment = employee.salary * Math.max(0.5, +assign.capacity);
  let vacationWorkingdays = 0;

  const workigDays = getWorkingDays();

  if (employee.vacations) {
    vacationWorkingdays = employee.vacations.length;
  }

  const vacationCoefficient = (workigDays - vacationWorkingdays) / workigDays;

  const effectiveCapacity = calculateEffectiveСapacity(
    assign.capacity,
    assign.fit,
    employee,
  );

  const revenue =
    (project.budget / project.employeeCapacity) * effectiveCapacity;

  const profit = revenue - employeePayment;

  const currentProjectCapacity = getCurrentProjectCapasity(project.id);
  const capacityAfterUnAssign = currentProjectCapacity - effectiveCapacity;

  modal.querySelector(".assigned-capacity-span").textContent =
    `${assign.capacity}`;

  modal.querySelector(".employee-salary-share-span").textContent =
    `$${employeePayment.toFixed(2)}`;
  modal.querySelector(".budget-share-span").textContent =
    `$${revenue.toFixed(2)}`;
  const employeeEstimatedIncomeSpan = modal.querySelector(
    ".employee-estimated-income-span",
  );
  employeeEstimatedIncomeSpan.textContent = `$${profit.toFixed(2)}`;
  if (profit >= 0) {
    employeeEstimatedIncomeSpan.classList.remove("negative-value");
    employeeEstimatedIncomeSpan.classList.add("positive-value");
  } else {
    employeeEstimatedIncomeSpan.classList.add("negative-value");
    employeeEstimatedIncomeSpan.classList.remove("positive-value");
  }
  modal.querySelector(".current-project-capacity-span").textContent =
    `${currentProjectCapacity.toFixed(2)}`;
  modal.querySelector(".capacity-after-unassignment-span").textContent =
    `${capacityAfterUnAssign.toFixed(2)}`;
  modal.querySelector(".project-income-now-span").textContent = "Hello";
  modal.querySelector(".project-income-after-span").textContent = "Hello";
}

export function updateModalSeedData() {
  const year = getDate().slice(0, 4);
  const month = new Date(year, getDate().slice(5)).toLocaleString("en-US", {
    month: "long",
  });

  document.querySelector(".data-txt-span").textContent = `${month} ${year}`;

  const tbody = document.querySelector(".tbody-seed-data");
  tbody.replaceChildren();
  const filledKeys = Object.entries(store.data).filter(
    ([key, value]) =>
      (value.projects.length !== 0 || value.employees.length !== 0) &&
      key !== getDate(),
  );

  document
    .querySelector(".no-data-to-copy")
    .classList.toggle("visible", filledKeys.length === 0);
  document
    .querySelector(".seed-data-table")
    .classList.toggle("hidden", filledKeys.length === 0);
  document
    .querySelector(".info-user-select-month-tx")
    .classList.toggle("hidden", filledKeys.length === 0);

  filledKeys.forEach(([key, value]) => {
    const year = key.slice(0, 4);
    const month = new Date(year, key.slice(5)).toLocaleString("en-US", {
      month: "long",
    });

    const numberOfProjects = value.projects.length;
    const numberOfEmloyees = value.employees.length;
    let totalDateIncomming = 0;
    value.projects.forEach((project) => {
      const projectBudget = calculateBudgetProject(project, key);
      totalDateIncomming += projectBudget.projectIncome;
    });

    const tr = document.createElement("tr");
    for (let i = 0; i < 6; i++) {
      const td = document.createElement("td");
      if (i === 0) {
        td.textContent = `${year}`;
      } else if (i === 1) {
        td.textContent = `${month}`;
      } else if (i === 2) {
        td.textContent = `${numberOfProjects}`;
      } else if (i === 3) {
        td.textContent = `${numberOfEmloyees}`;
      } else if (i === 4) {
        td.textContent = `$${totalDateIncomming.toFixed(2)}`;
      } else if (i === 5) {
        const btnSeedData = document.createElement("button");

        btnSeedData.className = "btn-action btn-action-seed-data";
        btnSeedData.dataset.key = key;
        btnSeedData.textContent = "Seed Data";

        td.append(btnSeedData);
      }

      tr.append(td);
    }

    tbody.append(tr);
  });
}

export function updateModalVacations(idEmployee) {
  const gridCalendar = document.querySelector(".grid-calendar");
  gridCalendar.replaceChildren();

  const currentDate = getDate();

  const currentYear = +currentDate.slice(0, 4);
  const currentMonth = +currentDate.slice(5);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const normalized = firstDay === 0 ? 6 : firstDay - 1;

  const employee = store.data[currentDate].employees.find(
    (emp) => emp.id === idEmployee,
  );

  for (let i = 0; i < normalized; i++) {
    const gridCell = document.createElement("div");
    gridCell.className = "calendar-day";
    gridCalendar.append(gridCell);
  }

  let workingDays = 0;
  let vacationWorkigDays = 0;

  for (let i = 1; i <= daysInMonth; i++) {
    const gridCell = document.createElement("div");
    gridCell.className = "calendar-day";
    gridCell.dataset.day = i;
    gridCell.textContent = i;

    const date = new Date(currentYear, currentMonth, i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (isWeekend) {
      gridCell.classList.add("weekend");
    } else {
      gridCell.classList.add("availability");
      workingDays++;
    }

    if (employee.vacations && employee.vacations.includes(String(i))) {
      gridCell.classList.add("selected");
      vacationWorkigDays++;
    }

    gridCalendar.append(gridCell);
  }

  const month = new Date(currentYear, currentMonth).toLocaleString("en-US", {
    month: "long",
  });

  document.querySelector(".vacations-current-date").textContent =
    `${currentYear} ${month}`;
  document.querySelector(".count-working-day-span").textContent =
    `${workingDays - vacationWorkigDays} / ${workingDays}`;
  document.querySelector(".vacations-txt-span").textContent =
    `${formatVacationsDays(employee.vacations, currentMonth)}`;
}

export function formatVacationsDays(vacations, month) {
  if (!vacations || vacations.length === 0) return "";

  const sorted = [...vacations].map(Number).sort((a, b) => a - b);

  const ranges = [];
  let start = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      if (start === sorted[i - 1]) {
        ranges.push(`${String(start).padStart(2, "0")}.${month}`);
      } else {
        ranges.push(
          `${String(start).padStart(2, "0")}.${month}-${String(sorted[i - 1]).padStart(2, "0")}.${month}`,
        );
      }
      start = sorted[i];
    }
  }

  if (start === sorted[sorted.length - 1]) {
    ranges.push(`${String(start).padStart(2, "0")}.${month}`);
  } else {
    ranges.push(
      `${String(start).padStart(2, "0")}.${month}-${String(sorted[sorted.length - 1]).padStart(2, "0")}.${month}`,
    );
  }

  return ranges.join(", ");
}

export function updateUI() {
  const monthData = getMonthData();

  updateUIProjects(monthData.projects);
  updateUIEmployees(monthData.employees);
  updateTotalStatistic();
}

export function getMonthData() {
  const month = store.data[getDate()];

  return {
    employees: month?.employees ?? [],
    projects: month?.projects ?? [],
  };
}
