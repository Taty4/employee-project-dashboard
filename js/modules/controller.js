import { Project } from "./state.js";
import { Employee } from "./state.js";
import { store } from "./state.js";
import { getDate } from "./action.js";
import { updateUIProjects } from "./ui.js";
import { updateUIEmployees } from "./ui.js";
import { closeAssignModal } from "./action.js";
import { openAssignModal } from "./action.js";
import { updateUIModalAssign } from "./ui.js";
import { calculateEffectiveСapacity } from "./action.js";
import { getCurrentProjectCapasity } from "./action.js";
import { openShowAssignModal } from "./action.js";
import { closeShowAssignModal } from "./action.js";
import { openShowEmpModal } from "./action.js";
import { closeShowEmpModal } from "./action.js";
import { openModalEditAssign } from "./action.js";
import { closeModalEditAssign } from "./action.js";
import { updateShowEmpModal } from "./ui.js";
import { updateShowAssignModal } from "./ui.js";
import { calculationOfCapacity } from "./action.js";
import { updateTotalStatistic } from "./ui.js";
import { openModalUnAssign } from "./action.js";
import { closeModalUnAssign } from "./action.js";
import { openModalSeedData } from "./action.js";
import { closeModalSeedData } from "./action.js";

export function initController() {
  // Левая панель контроллы

  const btnHiddenLeftSideBar = document.querySelector(".btn-hide-nav");
  const leftSideBar = document.querySelector(".left-sidebar");
  const btnShowLeftSideBar = document.querySelector(".btn-show ");

  btnHiddenLeftSideBar.addEventListener("click", () => {
    leftSideBar.classList.add("hidden");
    btnShowLeftSideBar.classList.add("visible");
  });

  btnShowLeftSideBar.addEventListener("click", () => {
    leftSideBar.classList.remove("hidden");
    btnShowLeftSideBar.classList.remove("visible");
  });

  // Навигация контроллы
  const navProjects = document.getElementById("nav-projects");
  const navEmployees = document.getElementById("nav-employees");
  const title = document.querySelector(".title-h1");

  const btnAddProject = document.querySelector(".btn-add-project");
  const btnAddEmployee = document.querySelector(".btn-add-employee");

  const rightSideBarProject = document.querySelector(".right-sidebar-projects");
  const rightSideBarEmployees = document.querySelector(
    ".right-sidebar-employees",
  );

  const tableProjects = document.querySelector(".main-table-projects");
  const tableEmployees = document.querySelector(".main-table-employees");

  navProjects.addEventListener("click", () => {
    navProjects.classList.add("active");
    navEmployees.classList.remove("active");
    rightSideBarEmployees.classList.remove("open");
    btnAddEmployee.classList.remove("visible");
    btnAddProject.classList.add("visible");
    title.textContent = "Projects";
    tableEmployees.classList.remove("active");
    tableProjects.classList.add("active");
  });

  navEmployees.addEventListener("click", () => {
    navEmployees.classList.add("active");
    navProjects.classList.remove("active");
    rightSideBarProject.classList.remove("open");
    btnAddProject.classList.remove("visible");
    btnAddEmployee.classList.add("visible");
    title.textContent = "Employees";
    tableProjects.classList.remove("active");
    tableEmployees.classList.add("active");
  });

  // Правая панель контроллы

  btnAddProject.addEventListener("click", () => {
    rightSideBarProject.classList.add("open");
  });

  btnAddEmployee.addEventListener("click", () => {
    rightSideBarEmployees.classList.add("open");
  });

  const formProject = document.getElementById("form-project");
  const formEmployee = document.getElementById("form-employee");
  const btnResetProject = document.querySelector(".btn-reset-project");
  const btnResetEmployee = document.querySelector(".btn-reset-employee");
  const btnSubmitProject = document.querySelector(".btn-submit-project");
  const btnSubmitEmployee = document.querySelector(".btn-submit-employee");

  btnResetProject.addEventListener("click", () => {
    event.preventDefault();
    formProject.reset();
    rightSideBarProject.classList.remove("open");
  });

  btnResetEmployee.addEventListener("click", () => {
    event.preventDefault();
    formEmployee.reset();
    rightSideBarEmployees.classList.remove("open");
  });

  // Обработка форм

  formProject.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(formProject);
    const data = Object.fromEntries(formData);
    const project = new Project(data);
    store.addProject(getDate(), project);
    formProject.reset();
    rightSideBarProject.classList.remove("open");

    updateUIEmployees();
    updateUIProjects();
    updateTotalStatistic();
  });

  formProject.addEventListener("input", () => {
    if (formProject.checkValidity()) {
      btnSubmitProject.disabled = false;
    } else {
      btnSubmitProject.disabled = true;
    }
  });

  formEmployee.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(formEmployee);
    const data = Object.fromEntries(formData);
    const emoloyee = new Employee(data);
    store.addEmployee(getDate(), emoloyee);
    formEmployee.reset();
    rightSideBarEmployees.classList.remove("open");

    updateUIProjects();
    updateUIEmployees();
    updateTotalStatistic();
  });

  formEmployee.addEventListener("input", () => {
    if (formEmployee.checkValidity()) {
      btnSubmitEmployee.disabled = false;
    } else {
      btnSubmitEmployee.disabled = true;
    }
  });

  // Cлушатели смены даты
  const inputSelectMonth = document.querySelector(".month-select");
  const inputSelectYear = document.querySelector(".year-select");

  inputSelectMonth.addEventListener("change", () => {
    updateUIProjects();
    updateUIEmployees();
    updateTotalStatistic();
  });

  inputSelectYear.addEventListener("change", () => {
    updateUIProjects();
    updateUIEmployees();
    updateTotalStatistic();
  });

  // Cлушатели кнопок action

  tableProjects.addEventListener("click", (event) => {
    if (event.target.closest(".btn-delete")) {
      const idProject = event.target.dataset.id;
      store.deleteProject(getDate(), idProject);
      updateUIEmployees();
      updateUIProjects();
      updateTotalStatistic();
    }

    if (event.target.closest(".btn-show-emp")) {
      const idProject = event.target.dataset.id;
      const project = store.data[getDate()]?.projects?.find(
        (item) => item.id === idProject,
      );
      openShowEmpModal(project);
    }
  });

  tableEmployees.addEventListener("click", (event) => {
    if (event.target.closest(".btn-delete")) {
      const idEmployee = event.target.dataset.id;
      store.deleteEmployee(getDate(), idEmployee);
      updateUIEmployees();
      updateUIProjects();
      updateTotalStatistic();
      return;
    }

    if (event.target.closest(".btn-assign")) {
      const idEmployee = event.target.dataset.id;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );
      updateUIModalAssign(employee);
      openAssignModal(employee);
    }

    if (event.target.closest(".btn-show-assign")) {
      const idEmployee = event.target.dataset.id;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );
      openShowAssignModal(employee);
    }
  });

  // Открытие/закрытие модалок

  const assignModalOverlay = document.getElementById("assign-modal-overlay");
  const showAssignModalOverlay = document.getElementById(
    "show-assign-modal-overlay",
  );
  const showEmpModalOverlay = document.getElementById("show-emp-modal-overlay");
  const showEditModalOverlay = document.getElementById(
    "show-edit-modal-overlay",
  );
  const showUnAssigntModalOverlay = document.getElementById(
    "show-unassign-modal-overlay",
  );

  const showModalDataSeed = document.getElementById("seed-data-modal-overlay");

  const btnCloseModal = assignModalOverlay.querySelector(".btn-close-modal");
  const btnCloseShowAssignModal =
    showAssignModalOverlay.querySelector(".btn-close-modal");
  const btnCloseShowEmpModal =
    showEmpModalOverlay.querySelector(".btn-close-modal");
  const btnCloseEdutModal =
    showEditModalOverlay.querySelector(".btn-close-modal");
  const btnCloseUnAssignModal =
    showUnAssigntModalOverlay.querySelector(".btn-close-modal");
  const btnCloseSeedDataModal =
    showModalDataSeed.querySelector(".btn-close-modal");

  btnCloseModal.addEventListener("click", closeAssignModal);
  btnCloseShowAssignModal.addEventListener("click", closeShowAssignModal);
  btnCloseShowEmpModal.addEventListener("click", closeShowEmpModal);
  btnCloseEdutModal.addEventListener("click", closeModalEditAssign);
  btnCloseUnAssignModal.addEventListener("click", closeModalUnAssign);
  btnCloseSeedDataModal.addEventListener("click", closeModalSeedData);

  document.addEventListener("click", (event) => {
    if (event.target === assignModalOverlay) {
      closeAssignModal();
    }

    if (event.target === showAssignModalOverlay) {
      closeShowAssignModal();
    }

    if (event.target === showEmpModalOverlay) {
      closeShowEmpModal();
    }

    if (event.target === showEditModalOverlay) {
      closeModalEditAssign();
    }

    if (event.target === showUnAssigntModalOverlay) {
      closeModalUnAssign();
    }
    if (event.target === showModalDataSeed) {
      closeModalSeedData();
    }
  });

  // Функция расчета эффектиного капасити (capasity * fit)

  function calculateEffectiveСapacity() {
    const capacity = document.getElementById("capacity-allocation").value;
    const fit = document.getElementById("project-fit").value;
    return (+capacity * +fit).toFixed(2);
  }

  // Слушатели на кнопки edit  в модалках

  const showEmployeesTable = document.querySelector(".tbody-show-emp");
  const showAssignmentsTable = document.querySelector(".tbody-show-assigments");
  const showDataSeedTable = document.querySelector(".tbody-seed-data");

  showEmployeesTable.addEventListener("click", (event) => {
    if (event.target.closest(".btn-edit-assign")) {
      const idEmployee = event.target.dataset.idEmployee;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );

      const idProject = event.target.dataset.idProject;
      const project = store.data[getDate()]?.projects?.find(
        (item) => item.id === idProject,
      );
      openModalEditAssign(employee, project);
    }

    if (event.target.closest(".btn-unassign")) {
      const idEmployee = event.target.dataset.idEmployee;
      const idProject = event.target.dataset.idProject;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );
      const project = store.data[getDate()]?.projects?.find(
        (item) => item.id === idProject,
      );
      /*   store.unAssign(idEmployee, idProject, key); */
      openModalUnAssign(employee, project);
    }
  });

  const btnUnAssignModal = document.querySelector(".btn-unassign-modal");

  btnUnAssignModal.addEventListener("click", () => {
    const idEmployee = showUnAssigntModalOverlay.dataset.idEmployee;
    const idProject = showUnAssigntModalOverlay.dataset.idProject;
    const key = getDate();

    const employee = store.data[getDate()]?.employees?.find(
      (item) => item.id === idEmployee,
    );
    const project = store.data[getDate()]?.projects?.find(
      (item) => item.id === idProject,
    );

    const capacity = inputCapacityEdit.value;
    const fit = inputFitEdit.value;

    store.unAssign(idEmployee, idProject, key);

    updateShowEmpModal(project, showEmpModalOverlay);
    updateShowAssignModal(employee, showAssignModalOverlay);
    updateUIEmployees();
    updateUIProjects();
    updateTotalStatistic();
    closeModalUnAssign();
  });

  showAssignmentsTable.addEventListener("click", (event) => {
    if (event.target.closest(".btn-edit-assign")) {
      const idEmployee = event.target.dataset.idEmployee;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );

      const idProject = event.target.dataset.idProject;
      const project = store.data[getDate()]?.projects?.find(
        (item) => item.id === idProject,
      );
      openModalEditAssign(employee, project);
    }

    if (event.target.closest(".btn-unassign")) {
      const idEmployee = event.target.dataset.idEmployee;
      const idProject = event.target.dataset.idProject;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );
      const project = store.data[getDate()]?.projects?.find(
        (item) => item.id === idProject,
      );

      openModalUnAssign(employee, project);
    }
  });

  showDataSeedTable.addEventListener("click", (event) => {
    if (event.target.closest(".btn-action-seed-data")) {
      const prevKey = event.target.dataset.key;
      const currentKey = getDate();
      store.copyMonthData(prevKey, currentKey);
      updateUIEmployees();
      updateUIProjects();
      updateTotalStatistic();
      closeModalSeedData();
    }
  });

  // Слушатель на кнопку "Назначить" (Assign)

  const btnAssign = document.querySelector(".btn-assign-modal");

  btnAssign.addEventListener("click", () => {
    const idEmployee = document.getElementById("assign-modal-overlay").dataset
      .idEmployee;
    const employee = store.data[getDate()]?.employees?.find(
      (item) => item.id === idEmployee,
    );
    const idProject = document.getElementById("select-project").value;

    const capacity = document.getElementById("capacity-allocation").value;
    const fit = document.getElementById("project-fit").value;

    if (idProject && employee) {
      if (employee.assignments.find((item) => item.idProject === idProject)) {
        store.editAssign(employee, idProject, capacity, fit);
      } else {
        store.assignToProject(employee, idProject, capacity, fit);
      }
    }

    updateUIEmployees();
    updateUIProjects();
    closeAssignModal();
    updateTotalStatistic();
  });

  // Слушатель инутов по вводу проекта, capasity и fit
  const selectProject = document.getElementById("select-project");
  const InputCapasity = document.getElementById("capacity-allocation");
  const InputFit = document.getElementById("project-fit");

  selectProject.addEventListener("change", () => {
    const capacityInputSection = document.querySelector(
      ".capasity-input-section",
    );

    if (!selectProject.value) {
      capacityInputSection.classList.remove("open");
      btnAssign.disabled = true;
      document.querySelector(
        ".other-project-current-capacity-txt",
      ).textContent = "Current capacity:";
      document.querySelector(".info-for-user").classList.remove("open");
      document.querySelector(".info-user-avialable").classList.remove("open");
    } else {
      capacityInputSection.classList.add("open");
      btnAssign.disabled = false;

      document.querySelector(
        ".other-project-current-capacity-txt",
      ).textContent = "Capacity on other projects:";

      document.querySelector(".info-for-user").classList.add("open");
      document.querySelector(".info-user-avialable").classList.add("open");

      const idEmployee = document.getElementById("assign-modal-overlay").dataset
        .idEmployee;
      const employee = store.data[getDate()]?.employees?.find(
        (item) => item.id === idEmployee,
      );

      const idProject = selectProject.value;

      const data = calculationOfCapacity(employee, idProject);

      document.querySelector(".avialable-capasity-value").textContent =
        `${data.availableForSelectionCapacity}`;

      document.querySelector(".other-projects-capacity-value").textContent =
        `${(1.5 - data.availableForSelectionCapacity).toFixed(2)}`;

      document.querySelector(".used-capacity").textContent =
        `${getCurrentProjectCapasity(idProject)} / 4`;

      if (+InputCapasity.value > data.availableForSelectionCapacity) {
        document.querySelector(".error-already-assign").style.display = "block";
        btnAssign.disabled = true;
      } else {
        document.querySelector(".error-already-assign").style.display = "none";
        btnAssign.disabled = false;
      }
    }
  });

  InputCapasity.addEventListener("input", () => {
    const idProject = selectProject.value;
    const idEmployee = assignModalOverlay.dataset.idEmployee;
    const employee = store.data[getDate()].employees.find(
      (item) => item.id === idEmployee,
    );

    const data = calculationOfCapacity(employee, idProject);

    document.querySelector(".target-capacity").textContent =
      `${(+getCurrentProjectCapasity(idProject) + +calculateEffectiveСapacity()).toFixed(2)} / 4`;

    // TODO cделать проверку на возможность выбора капасити во время открытия модалки
    if (+InputCapasity.value > data.availableForSelectionCapacity) {
      document.querySelector(".error-already-assign").style.display = "block";
      btnAssign.disabled = true;
    } else {
      document.querySelector(".error-already-assign").style.display = "none";
      btnAssign.disabled = false;
    }

    document.querySelector(".capasity-input-span").textContent =
      `${InputCapasity.value}`;
    document.querySelector(".effective-capacity").textContent =
      `${calculateEffectiveСapacity()}`;
  });

  InputFit.addEventListener("input", () => {
    const idProject = selectProject.value;

    const idEmployee = assignModalOverlay.dataset.idEmployee;
    const employee = store.data[getDate()].employees.find(
      (item) => item.id === idEmployee,
    );

    const targetAssign = employee.assignments.find(
      (item) => item.idProject === idProject,
    );

    if (employee.assignments.find((item) => item.idProject === idProject)) {
      document.querySelector(".target-capacity").textContent =
        `${(+getCurrentProjectCapasity(idProject) - targetAssign.capacity * targetAssign.fit + +calculateEffectiveСapacity()).toFixed(2)} / 4`;
    } else {
      document.querySelector(".target-capacity").textContent =
        `${(+getCurrentProjectCapasity(idProject) + +calculateEffectiveСapacity()).toFixed(2)} / 4`;
    }

    document.querySelector(".fit-input-span").textContent = `${InputFit.value}`;
    document.querySelector(".effective-capacity").textContent =
      `${calculateEffectiveСapacity()}`;
  });

  // Cлушатели инпутов в модалке edit

  const inputCapacityEdit = showEditModalOverlay.querySelector(
    "#capacity-allocation",
  );
  const inputFitEdit = showEditModalOverlay.querySelector("#project-fit");
  const btnSaveEdit = document.querySelector(".btn-save-edit-modal");

  inputCapacityEdit.addEventListener("input", () => {
    showEditModalOverlay.querySelector(".capasity-input-span").textContent =
      `${inputCapacityEdit.value}`;

    const idEmployee = showEditModalOverlay.dataset.idEmployee;
    const employee = store.data[getDate()].employees.find(
      (item) => item.id === idEmployee,
    );

    const idProject = showEditModalOverlay.dataset.idProject;

    const data = calculationOfCapacity(employee, idProject);

    if (+inputCapacityEdit.value > data.availableForSelectionCapacity) {
      showEditModalOverlay.querySelector(".current-capacity-txt").textContent =
        `${(1.5 - +data.availableForSelectionCapacity).toFixed(2)}`;
      showEditModalOverlay.querySelector(".error-too-capacity").style.display =
        "block";
      btnSaveEdit.disabled = true;
    } else {
      showEditModalOverlay.querySelector(".error-too-capacity").style.display =
        "none";
      btnSaveEdit.disabled = false;
    }
  });

  inputFitEdit.addEventListener("input", () => {
    showEditModalOverlay.querySelector(".fit-input-span").textContent =
      `${inputFitEdit.value}`;
  });

  // Кнопка сохранить изменения

  btnSaveEdit.addEventListener("click", () => {
    const idEmployee = showEditModalOverlay.dataset.idEmployee;
    const idProject = showEditModalOverlay.dataset.idProject;

    const employee = store.data[getDate()]?.employees?.find(
      (item) => item.id === idEmployee,
    );
    const project = store.data[getDate()]?.projects?.find(
      (item) => item.id === idProject,
    );

    const capacity = inputCapacityEdit.value;
    const fit = inputFitEdit.value;

    if (project && employee) {
      store.editAssign(employee, idProject, capacity, fit);
    }
    updateShowEmpModal(project, showEmpModalOverlay);
    updateShowAssignModal(employee, showAssignModalOverlay);
    updateUIEmployees();
    updateUIProjects();
    updateTotalStatistic();
    closeModalEditAssign();
  });

  const btnSeedData = document.querySelector(".btn-seed-data");

  btnSeedData.addEventListener("click", () => {
    openModalSeedData();
  });

  updateUIEmployees();
  updateUIProjects();
  updateTotalStatistic();
}
