import { store } from "./state.js";
import { updateShowAssignModal } from "./ui.js";
import { updateShowEmpModal } from "./ui.js";
import { updateModalEditAssign } from "./ui.js";
import { updateModalUnAssign } from "./ui.js";

export function getDate() {
  const inputSelectMonth = document.querySelector(".month-select");
  const inputSelectYear = document.querySelector(".year-select");
  const month = inputSelectMonth.value;
  const year = inputSelectYear.value;
  return `${year}-${month}`;
}

export function closeAssignModal() {
  const assignModalOverlay = document.getElementById("assign-modal-overlay");
  assignModalOverlay.classList.remove("open");
  const capacityInputSection = document.querySelector(
    ".capasity-input-section",
  );
  assignModalOverlay.dataset.idEmployee = "";
  capacityInputSection.classList.remove("open");
}

export function openAssignModal(employee) {
  if (!employee) return;

  const assignModalOverlay = document.getElementById("assign-modal-overlay");
  assignModalOverlay.dataset.idEmployee = employee.id;
  assignModalOverlay.classList.add("open");
}

export function openShowAssignModal(employee) {
  if (!employee) return;

  const showAssignModalOverlay = document.getElementById(
    "show-assign-modal-overlay",
  );

  showAssignModalOverlay.dataset.idEmployee = employee.id;
  updateShowAssignModal(employee, showAssignModalOverlay);
  showAssignModalOverlay.classList.add("open");
}

export function closeShowAssignModal() {
  const showAssignModalOverlay = document.getElementById(
    "show-assign-modal-overlay",
  );
  showAssignModalOverlay.classList.remove("open");
  showAssignModalOverlay.dataset.idEmployee = "";
}

export function calculateEffectiveСapacity() {
  const capacity = document.getElementById("capacity-allocation").value;
  const fit = document.getElementById("project-fit").value;
  return (capacity * fit).toFixed(2);
}

export function getCurrentProjectCapasity(idProject) {
  let totalCapacity = 0;
  const data = store.data;
  const employees = data[getDate()].employees;
  if (employees.length !== 0) {
    employees.forEach((employee) => {
      const assignments = employee.assignments;
      assignments.forEach((item) => {
        if (item.idProject === idProject) {
          totalCapacity += Number(item.capacity) * Number(item.fit);
        }
      });
    });
  }
  return totalCapacity.toFixed(2);
}

// ===============
export function openShowEmpModal(project) {
  if (!project) return;

  const showEmpModalOverlay = document.getElementById("show-emp-modal-overlay");
  showEmpModalOverlay.dataset.idProject = project.id;
  updateShowEmpModal(project, showEmpModalOverlay);
  showEmpModalOverlay.classList.add("open");
}

export function closeShowEmpModal() {
  const showEmpModalOverlay = document.getElementById("show-emp-modal-overlay");
  showEmpModalOverlay.classList.remove("open");
}

export function openModalEditAssign(employee, project) {
  if (!employee || !project) return;
  const showEditModalOverlay = document.getElementById(
    "show-edit-modal-overlay",
  );
  showEditModalOverlay.dataset.idEmployee = employee.id;
  showEditModalOverlay.dataset.idProject = project.id;
  updateModalEditAssign(employee, project, showEditModalOverlay);
  showEditModalOverlay.classList.add("open");
}

export function closeModalEditAssign() {
  const showEditModalOverlay = document.getElementById(
    "show-edit-modal-overlay",
  );
  showEditModalOverlay.classList.remove("open");
}

export function calculationOfCapacity(employee, idProject) {
  const data = {};
  const project = store.data[getDate()]?.projects?.find(
    (item) => item.id === idProject,
  );

  let currentCapacity = 0;
  employee.assignments.forEach((item) => (currentCapacity += +item.capacity));

  data.currentCapacityEmployee = currentCapacity;

  if (employee.assignments.find((item) => item.idProject === idProject)) {
    const assign = employee.assignments.find(
      (item) => item.idProject === idProject,
    );

    data.availableForSelectionCapacity = (
      1.5 -
      (currentCapacity - assign.capacity)
    ).toFixed(2);
  } else {
    data.availableForSelectionCapacity = (1.5 - currentCapacity).toFixed(2);
  }

  console.log(data);
  return data;
}

export function calculateBudgetEmployee(employee) {
  let estimatedPayment = 0;
  let projectedIncome = 0;
  let totalCapasity = 0;
  let benchPayment = 0;

  if (employee.assignments.length === 0) {
    estimatedPayment = +employee.salary * 0.5;
    projectedIncome = projectedIncome - estimatedPayment;
    benchPayment += estimatedPayment;
  } else {
    employee.assignments.forEach((assign) => {
      totalCapasity += +assign.capacity;

      const project = store.data[getDate()]?.projects?.find(
        (item) => item.id === assign.idProject,
      );

      const revenue = (
        (project.budget / project.employeeCapacity) *
        assign.capacity *
        assign.fit
      ).toFixed(2);

      const cost = employee.salary * Math.max(0.5, assign.capacity);

      const profit = revenue - cost;

      projectedIncome += profit;
    });

    estimatedPayment = Math.max(0.5, totalCapasity) * +employee.salary;
    console.log(estimatedPayment);
  }
  console.log({
    estimatedPayment: estimatedPayment,
    projectedIncome: projectedIncome,
    totalCapasity: totalCapasity,
  });
  return {
    estimatedPayment: estimatedPayment.toFixed(2),
    projectedIncome: projectedIncome.toFixed(2),
    totalCapasity: totalCapasity,
    benchPayment: benchPayment.toFixed(2),
  };
}

export function calculateBudgetProject(project) {
  let projectIncome = 0;

  const employees = store.data[getDate()].employees;
  const hasEmployees = employees.find((employee) =>
    employee.assignments.find((ass) => ass.idProject === project.id),
  );

  if (hasEmployees) {
    employees.forEach((emp) => {
      if (emp.assignments.find((assign) => assign.idProject === project.id)) {
        const assign = emp.assignments.find(
          (assign) => assign.idProject === project.id,
        );
        const revenue = (
          (project.budget / project.employeeCapacity) *
          assign.capacity *
          assign.fit
        ).toFixed(2);

        const cost = (emp.salary * Math.max(0.5, assign.capacity)).toFixed(2);

        const profit = revenue - cost;
        projectIncome += profit;
      }
    });
  }

  return {
    projectIncome: projectIncome.toFixed(2),
    hasEmployees: hasEmployees,
  };
}

// =====================
export function openModalUnAssign(employee, project) {
  if (!employee || !project) return;
  const showUnAssigntModalOverlay = document.getElementById(
    "show-unassign-modal-overlay",
  );
  showUnAssigntModalOverlay.dataset.idEmployee = employee.id;
  showUnAssigntModalOverlay.dataset.idProject = project.id;
  updateModalUnAssign(employee, project, showUnAssigntModalOverlay);
  showUnAssigntModalOverlay.classList.add("open");
}

export function closeModalUnAssign() {
  const showUnAssigntModalOverlay = document.getElementById(
    "show-unassign-modal-overlay",
  );
  showUnAssigntModalOverlay.classList.remove("open");
}

export function openModalSeedData() {
  const showModalDataSeed = document.getElementById("seed-data-modal-overlay");

  showModalDataSeed.classList.add("open");
}

export function closeModalSeedData() {
  const showModalDataSeed = document.getElementById("seed-data-modal-overlay");
  showModalDataSeed.classList.remove("open");
}
