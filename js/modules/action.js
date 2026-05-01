import { store } from "./state.js";
import { updateShowAssignModal } from "./ui.js";
import { updateShowEmpModal } from "./ui.js";
import { updateModalEditAssign } from "./ui.js";
import { updateModalUnAssign } from "./ui.js";
import { updateModalSeedData } from "./ui.js";
import { updateModalVacations } from "./ui.js";

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

export function calculateEffectiveСapacity(capacity, fit, employee) {
  const workigDays = getWorkingDays();
  let vacationWorkingday = 0;
  if (employee.vacations) {
    vacationWorkingday = employee.vacations.length;
  }
  const vacationCoefficient = (workigDays - vacationWorkingday) / workigDays;
  return capacity * fit * vacationCoefficient;
}

export function getCurrentProjectCapasity(idProject) {
  let totalCapacity = 0;
  let vacationWorkingdays = 0;
  const data = store.data;
  const employees = data[getDate()].employees;
  if (employees.length !== 0) {
    employees.forEach((employee) => {
      const workigDays = getWorkingDays();
      if (employee.vacations) {
        vacationWorkingdays = employee.vacations.length;
      }

      const vacationCoefficient =
        (workigDays - vacationWorkingdays) / workigDays;

      const assignments = employee.assignments;
      assignments.forEach((item) => {
        if (item.idProject === idProject) {
          totalCapacity +=
            Number(item.capacity) * Number(item.fit) * vacationCoefficient;
        }
      });
    });
  }
  return totalCapacity;
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

  return data;
}

export function calculateBudgetEmployee(employee) {
  let estimatedPayment = 0;
  let projectedIncome = 0;
  let totalCapasity = 0;
  let benchPayment = 0; /* Не факт что оно нужно именно здесь */
  let vacationWorkingdays = 0;

  const workigDays = getWorkingDays();

  if (employee.vacations) {
    vacationWorkingdays = employee.vacations.length;
  }

  const vacationCoefficient = (workigDays - vacationWorkingdays) / workigDays;

  if (!employee.assignments || employee.assignments.length === 0) {
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
        assign.fit *
        vacationCoefficient
      ).toFixed(2);

      const cost = employee.salary * Math.max(0.5, assign.capacity);

      const profit = revenue - cost;

      projectedIncome += profit;
    });

    estimatedPayment = Math.max(0.5, totalCapasity) * +employee.salary;
  }
  return {
    estimatedPayment: estimatedPayment,
    projectedIncome: projectedIncome,
    totalCapasity: totalCapasity,
    benchPayment: benchPayment,
  };
}

export function calculateBudgetProject(project, date) {
  let projectIncome = 0;

  const employees = store.data[date].employees;
  const hasEmployees = employees.find((employee) =>
    employee.assignments.find((ass) => ass.idProject === project.id),
  );

  if (hasEmployees) {
    employees.forEach((emp) => {
      if (emp.assignments.find((assign) => assign.idProject === project.id)) {
        const assign = emp.assignments.find(
          (assign) => assign.idProject === project.id,
        );

        const workigDays = getWorkingDays();
        let vacationWorkingdays = 0;

        if (emp.vacations) {
          vacationWorkingdays = emp.vacations.length;
        }

        const vacationCoefficient =
          (workigDays - vacationWorkingdays) / workigDays;

        const revenue = (
          (project.budget / project.employeeCapacity) *
          assign.capacity *
          assign.fit *
          vacationCoefficient
        ).toFixed(2);

        const cost = emp.salary * Math.max(0.5, assign.capacity);

        const profit = revenue - cost;
        projectIncome += profit;
      }
    });
  }

  return {
    projectIncome: projectIncome,
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
  updateModalSeedData();
  showModalDataSeed.classList.add("open");
}

export function closeModalSeedData() {
  const showModalDataSeed = document.getElementById("seed-data-modal-overlay");
  showModalDataSeed.classList.remove("open");
}

export function openModalVacations(idEmployee) {
  const modalOverlay = document.getElementById("modal-overlay-vacations");
  modalOverlay.dataset.idEmployee = idEmployee;
  updateModalVacations(idEmployee);
  modalOverlay.classList.add("open");
}

export function closeModalVacations() {
  const modalOverlay = document.getElementById("modal-overlay-vacations");
  modalOverlay.classList.remove("open");
}

export function getWorkingDays() {
  const currentDate = getDate();

  const currentYear = +currentDate.slice(0, 4);
  const currentMonth = +currentDate.slice(5);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (!isWeekend) {
      workingDays++;
    }
  }

  return workingDays;
}
