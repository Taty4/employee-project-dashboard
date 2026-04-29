import { getDate } from "./action.js";
import { getCurrentProjectCapasity } from "./action.js";
import { store } from "./state.js";
import { calculateBudgetEmployee } from "./action.js";
import { calculateBudgetProject } from "./action.js";
import { calculationOfCapacity } from "./action.js";

let totalIncome = 0;
let benchPayment;
export function updateUIProjects() {
  const tableProjectsBody = document.querySelector(".tbody-projects");
  if (
    !store.data[getDate()] ||
    !store.data[getDate()].projects ||
    !store.data[getDate()].projects.length === 0
  ) {
    tableProjectsBody.replaceChildren();
    return;
  }

  tableProjectsBody.replaceChildren();

  const projects = store.data[getDate()].projects;

  projects.forEach((project) => {
    const data = calculateBudgetProject(project);

    const newStroke = document.createElement("tr");
    for (let i = 0; i < 7; i++) {
      const newCell = document.createElement("td");
      if (i === 0) {
        newCell.textContent = `${project.projectName}`;
      } else if (i === 1) {
        newCell.textContent = `${project.companyName}`;
      } else if (i === 2) {
        newCell.textContent = `$${project.budget}`;
      } else if (i === 3) {
        newCell.textContent = `${getCurrentProjectCapasity(project.id)} / ${project.employeeCapacity}`;
      } else if (i === 4) {
        if (data.hasEmployees) {
          const btnShowEmp = document.createElement("button");
          btnShowEmp.className = "btn-action btn-show-emp";
          btnShowEmp.dataset.id = project.id;
          btnShowEmp.textContent = "Show Emploeyees";
          newCell.append(btnShowEmp);
        }
      } else if (i === 5) {
        if (+data.projectIncome < 0) {
          newCell.className = "negative-value";
        } else {
          newCell.className = "positive-value";
        }
        newCell.textContent = `$${data.projectIncome}`;
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

export function updateUIEmployees() {
  const tableEmployeesBody = document.querySelector(".tbody-employees");
  if (
    !store.data[getDate()] ||
    !store.data[getDate()].employees ||
    !store.data[getDate()].employees.length === 0
  ) {
    tableEmployeesBody.replaceChildren();
    return;
  }

  tableEmployeesBody.replaceChildren();
  const employees = store.data[getDate()].employees;
  totalIncome = 0;
  benchPayment = 0;
  employees.forEach((employee) => {
    const newStroke = document.createElement("tr");

    const data = calculateBudgetEmployee(employee);
    let currentCapacity = 0;
    employee.assignments.forEach((item) => (currentCapacity += +item.capacity));

    benchPayment += +data.benchPayment;
    totalIncome += +data.projectedIncome;
    for (let i = 0; i < 9; i++) {
      const newCell = document.createElement("td");

      if (i === 0) {
        newCell.textContent = `${employee.name}`;
      } else if (i === 1) {
        newCell.textContent = `${employee.surname}`;
      } else if (i === 2) {
        newCell.textContent = `${employee.age}`;
      } else if (i === 3) {
        newCell.textContent = `${employee.position}`;
      } else if (i === 4) {
        newCell.textContent = `$${employee.salary}`;
      } else if (i === 5) {
        newCell.textContent = `$${data.estimatedPayment}`;
      } else if (i === 6 && employee.assignments.length !== 0) {
        const btnShowAssignments = document.createElement("button");
        btnShowAssignments.dataset.id = employee.id;
        btnShowAssignments.className = "btn-action btn-show-assign";
        btnShowAssignments.textContent = "Show Assignments";

        newCell.append(btnShowAssignments);
      } else if (i === 7) {
        if (+data.projectedIncome < 0) {
          newCell.className = "negative-value";
        } else {
          newCell.className = "positive-value";
        }
        newCell.textContent = `$${data.projectedIncome}`;
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
        btnAvailability.dataset.id = employee.id;
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

  if (employee.assignments.length === 0) {
    modal.querySelector(".no-assigments").classList.add("open");
    return;
  }

  modal.querySelector(".no-assigments").classList.remove("open");

  employee.assignments.forEach((assign) => {
    const idProject = assign.idProject;

    const project = store.data[getDate()]?.projects?.find(
      (item) => item.id === idProject,
    );

    const revenue = (
      (project.budget / project.employeeCapacity) *
      assign.capacity *
      assign.fit
    ).toFixed(2);

    const cost = (employee.salary * Math.max(0.5, assign.capacity)).toFixed(2);

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
        td.textContent = "-";
      } else if (i === 4) {
        td.textContent = `${(assign.capacity * assign.fit).toFixed(2)}`;
      } else if (i === 5) {
        td.textContent = `${revenue}`;
      } else if (i === 6) {
        td.textContent = `${cost}`;
      } else if (i === 7) {
        td.textContent = `${revenue - cost}`;
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
      const revenue = (
        (project.budget / project.employeeCapacity) *
        assign.capacity *
        assign.fit
      ).toFixed(2);

      const cost = (employee.salary * Math.max(0.5, assign.capacity)).toFixed(
        2,
      );

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
          td.textContent = "-";
        } else if (i === 4) {
          td.textContent = `${(assign.capacity * assign.fit).toFixed(2)}`;
        } else if (i === 5) {
          td.textContent = `${revenue}`;
        } else if (i === 6) {
          td.textContent = `${cost}`;
        } else if (i === 7) {
          td.textContent = `${revenue - cost}`;
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

  cardTotalIncome.textContent = `$${totalIncome}`;
  cardTotalProjects.textContent = `${totalProjects}`;
  cardTotalEmployees.textContent = `${totalEmployees}`;
  document.querySelector(".bench-payment-span").textContent =
    `(Bench payment $${benchPayment})`;
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

  const employeePayment = (
    employee.salary * Math.max(0.5, +assign.capacity)
  ).toFixed(2);

  const revenue = (
    (project.budget / project.employeeCapacity) *
    assign.capacity *
    assign.fit
  ).toFixed(2);

  const currentProjectCapacity = getCurrentProjectCapasity(project.id);
  const capacityAfterUnAssign = (
    +currentProjectCapacity -
    +assign.capacity * +assign.fit
  ).toFixed(2);

  modal.querySelector(".assigned-capacity-span").textContent =
    `${assign.capacity}`;

  modal.querySelector(".employee-salary-share-span").textContent =
    `$${employeePayment}`;
  modal.querySelector(".budget-share-span").textContent = `$${revenue}`;
  const employeeEstimatedIncomeSpan = modal.querySelector(
    ".employee-estimated-income-span",
  );
  employeeEstimatedIncomeSpan.textContent = `$${revenue - employeePayment}`;
  if (revenue - employeePayment >= 0) {
    employeeEstimatedIncomeSpan.classList.remove("negative-value");
    employeeEstimatedIncomeSpan.classList.add("positive-value");
  } else {
    employeeEstimatedIncomeSpan.classList.add("negative-value");
    employeeEstimatedIncomeSpan.classList.remove("positive-value");
  }
  modal.querySelector(".current-project-capacity-span").textContent =
    `${currentProjectCapacity}`;
  modal.querySelector(".capacity-after-unassignment-span").textContent =
    `${capacityAfterUnAssign}`;
  modal.querySelector(".project-income-now-span").textContent = "Hello";
  modal.querySelector(".project-income-after-span").textContent = "Hello";
}
