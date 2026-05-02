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
import { openModalVacations } from "./action.js";
import { closeModalVacations } from "./action.js";
import { formatVacationsDays } from "./ui.js";
import { updateUI } from "./ui.js";
import { getWorkingDays } from "./action.js";
import { getMonthData } from "./ui.js";
import { calculateBudgetProject } from "./action.js";
import { calculateBudgetEmployee } from "./action.js";

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

  const btnFilterProjects = document.querySelector(".btn-filter-projects");
  const btnFilterEmployees = document.querySelector(".btn-filter-employees");

  const rightSideBarProject = document.querySelector(".right-sidebar-projects");
  const rightSideBarEmployees = document.querySelector(
    ".right-sidebar-employees",
  );

  const tableProjects = document.querySelector(".main-table-projects");
  const tableEmployees = document.querySelector(".main-table-employees");

  navProjects.addEventListener("click", () => {
    navProjects.classList.add("active");
    document.querySelector(".info-about-projects-txt").textContent =
      "Overview of all projects and key metrics";
    navEmployees.classList.remove("active");
    rightSideBarEmployees.classList.remove("open");
    btnAddEmployee.classList.remove("visible");
    btnAddProject.classList.add("visible");
    title.textContent = "Projects";
    tableEmployees.classList.remove("active");
    tableProjects.classList.add("active");
    btnFilterProjects.classList.add("visible");
    btnFilterEmployees.classList.remove("visible");
    closeFormSearch();
  });

  navEmployees.addEventListener("click", () => {
    navEmployees.classList.add("active");
    navProjects.classList.remove("active");
    document.querySelector(".info-about-projects-txt").textContent =
      "Overview of all employees and key metrics";
    rightSideBarProject.classList.remove("open");
    btnAddProject.classList.remove("visible");
    btnAddEmployee.classList.add("visible");
    title.textContent = "Employees";
    tableProjects.classList.remove("active");
    tableEmployees.classList.add("active");
    btnFilterProjects.classList.remove("visible");
    btnFilterEmployees.classList.add("visible");
    closeFormSearch();
  });

  const formSearchProjects = document.querySelector(".form-search-projects");
  const formSearchEmployees = document.querySelector(".form-search-employees");

  btnFilterProjects.addEventListener("click", () => {
    formSearchProjects.querySelectorAll("input, select").forEach((input) => {
      input.classList.remove("hidden");
    });

    formSearchProjects.classList.toggle(
      "open",
      !formSearchProjects.classList.contains("open"),
    );
  });

  btnFilterEmployees.addEventListener("click", () => {
    formSearchEmployees.querySelectorAll("input, select").forEach((input) => {
      input.classList.remove("hidden");
    });

    formSearchEmployees.classList.toggle(
      "open",
      !formSearchEmployees.classList.contains("open"),
    );
  });

  formSearchEmployees.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-cancel-search")) {
      event.preventDefault();
      closeFormSearch(event.target);
      updateUI();
    }
  });

  formSearchProjects.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-cancel-search")) {
      event.preventDefault();
      closeFormSearch(event.target);
      updateUI();
    }
  });

  const filtersState = new Map([
    [formSearchProjects, {}],
    [formSearchEmployees, {}],
  ]);

  function getRowField(row) {
    const input = row.querySelector("input, select");
    return row.dataset.field || input?.id || input?.name || "unknown";
  }

  // ---------- MAIN RENDER ----------
  function render(form) {
    renderChips(form);
    renderAddButton(form);
  }

  function handleSearchSubmit(form, event) {
    event.preventDefault();

    const rows = form.querySelectorAll(".row-search");
    const state = filtersState.get(form);

    rows.forEach((row) => {
      const field = getRowField(row);
      const input = row.querySelector("input, select");
      const value = input?.value.trim();

      if (value) {
        state[field] = value;
      } else {
        delete state[field];
      }
    });

    const hasFilters = Object.keys(state).length > 0;
    form.dataset.compact = hasFilters ? "true" : "false";
    if (!hasFilters) {
      form.querySelectorAll("input, select").forEach((fieldInput) => {
        fieldInput.classList.remove("hidden");
      });
    }

    render(form);
  }

  formSearchProjects.addEventListener("submit", (event) => {
    handleSearchSubmit(formSearchProjects, event);

    // Получить активные фильтры
    const filters = filtersState.get(formSearchProjects);

    // Получить данные за месяц
    const monthData = getMonthData();

    // Отфильтровать проекты
    const filtered = monthData.projects.filter((project) => {
      if (
        filters["company-name"] &&
        !project.companyName
          .toLowerCase()
          .includes(filters["company-name"].toLowerCase())
      ) {
        return false;
      }

      if (
        filters["project-name"] &&
        !project.projectName
          .toLowerCase()
          .includes(filters["project-name"].toLowerCase())
      ) {
        return false;
      }

      return true;
    });

    // Отобразить отфильтрованные данные
    updateUIProjects(filtered);
  });

  formSearchEmployees.addEventListener("submit", (event) => {
    handleSearchSubmit(formSearchEmployees, event);

    const filters = filtersState.get(formSearchEmployees);
    const monthData = getMonthData();

    const filtered = monthData.employees.filter((employee) => {
      if (
        filters["name"] &&
        !employee.name.toLowerCase().includes(filters["name"].toLowerCase())
      ) {
        return false;
      }

      if (
        filters["surname"] &&
        !employee.surname
          .toLowerCase()
          .includes(filters["surname"].toLowerCase())
      ) {
        return false;
      }

      if (filters["position"] && employee.position !== filters["position"]) {
        return false;
      }

      if (filters["projects"]) {
        const hasProject = employee.assignments.some((assignment) => {
          const project = store.data[getDate()]?.projects?.find(
            (p) => p.id === assignment.idProject,
          );
          return (
            project &&
            project.projectName
              .toLowerCase()
              .includes(filters["projects"].toLowerCase())
          );
        });

        if (!hasProject) {
          return false;
        }
      }

      return true;
    });

    updateUIEmployees(filtered);
  });

  function applyFiltersForForm(form) {
    const filters = filtersState.get(form);
    const monthData = getMonthData();

    if (form === formSearchProjects) {
      const filtered = monthData.projects.filter((project) => {
        if (
          filters["company-name"] &&
          !project.companyName
            .toLowerCase()
            .includes(filters["company-name"].toLowerCase())
        ) {
          return false;
        }

        if (
          filters["project-name"] &&
          !project.projectName
            .toLowerCase()
            .includes(filters["project-name"].toLowerCase())
        ) {
          return false;
        }

        return true;
      });

      updateUIProjects(filtered);
      return;
    }

    if (form === formSearchEmployees) {
      const filtered = monthData.employees.filter((employee) => {
        if (
          filters["name"] &&
          !employee.name.toLowerCase().includes(filters["name"].toLowerCase())
        ) {
          return false;
        }

        if (
          filters["surname"] &&
          !employee.surname
            .toLowerCase()
            .includes(filters["surname"].toLowerCase())
        ) {
          return false;
        }

        if (filters["position"] && employee.position !== filters["position"]) {
          return false;
        }

        if (filters["projects"]) {
          const hasProject = employee.assignments.some((assignment) => {
            const project = store.data[getDate()]?.projects?.find(
              (p) => p.id === assignment.idProject,
            );
            return (
              project &&
              project.projectName
                .toLowerCase()
                .includes(filters["projects"].toLowerCase())
            );
          });

          if (!hasProject) {
            return false;
          }
        }

        return true;
      });

      updateUIEmployees(filtered);
    }
  }

  // ---------- CHIPS ----------
  function renderChips(form) {
    const rows = form.querySelectorAll(".row-search");

    rows.forEach((row) => {
      const input = row.querySelector("input, select");

      row.querySelector(".chip")?.remove();

      const field = getRowField(row);
      const state = filtersState.get(form);
      const value = state[field];
      const label = input?.placeholder || input?.name || input?.id || field;

      if (value) {
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = `${label}: ${value}`;

        const remove = document.createElement("span");
        remove.textContent = " ⨯";

        remove.onclick = (event) => {
          event.stopPropagation();
          const state = filtersState.get(form);
          delete state[field];

          const hasFilters = Object.keys(state).length > 0;
          if (!hasFilters) {
            form.reset();
            form.dataset.compact = "false";
            form.querySelectorAll("input, select").forEach((fieldInput) => {
              fieldInput.classList.remove("hidden");
            });
          }

          render(form);
          applyFiltersForForm(form);
        };

        chip.appendChild(remove);
        chip.onclick = () => {
          form.dataset.compact = "false";
          form.querySelectorAll("input, select").forEach((fieldInput) => {
            fieldInput.classList.remove("hidden");
          });
          form
            .querySelectorAll(".chip")
            .forEach((chipItem) => chipItem.remove());
          renderAddButton(form);
        };
        row.appendChild(chip);

        input.classList.add("hidden");
      } else {
        if (form.dataset.compact === "true") {
          input.classList.add("hidden");
        } else {
          input.classList.remove("hidden");
        }
      }
    });
  }

  // ---------- ADD BUTTON ----------
  function renderAddButton(form) {
    const container = form.querySelector(".container-inputs-search");

    let btn = form.querySelector(".btn-add-filter");

    const inputs = [...form.querySelectorAll("input, select")];
    const hasHiddenInputs = inputs.some((i) => i.classList.contains("hidden"));

    if (!btn && hasHiddenInputs) {
      btn = document.createElement("button");
      btn.className = "btn-add-filter";
      btn.textContent = "Change";

      btn.onclick = (e) => {
        e.preventDefault();

        form.dataset.compact = "false";
        inputs.forEach((input) => {
          input.classList.remove("hidden");
        });
        inputs[0]?.focus();
        form.querySelectorAll(".chip").forEach((chipItem) => chipItem.remove());
        renderAddButton(form);
      };

      container.appendChild(btn);
    }

    if (btn && !hasHiddenInputs) {
      btn.remove();
    }
  }

  // ---------- INIT ----------
  render(formSearchProjects);
  render(formSearchEmployees);

  function closeFormSearch() {
    document.querySelectorAll(".form-search").forEach((form) => {
      form.reset();
      form.classList.remove("open");
    });
  }

  // ============================

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

    updateUI();
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

    updateUI();
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
    updateUI();
  });

  inputSelectYear.addEventListener("change", () => {
    updateUI();
  });

  // Cлушатели кнопок action

  tableProjects.addEventListener("click", (event) => {
    if (event.target.closest(".btn-delete")) {
      const idProject = event.target.dataset.id;
      store.deleteProject(getDate(), idProject);
      updateUI();
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
      updateUI();
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

    if (event.target.closest(".btn-availability")) {
      const idEmployee = event.target.dataset.idEmployee;
      openModalVacations(idEmployee);
    }

    let cell;
    if ((cell = event.target.closest(".editable-position, .editable-salary"))) {
      cell.classList.add("open");
      const input = cell.querySelector(".form-edit");
      input.focus();
    }
  });

  tableEmployees.addEventListener("keydown", (event) => {
    const target = event.target;
    const container = target.closest(".editable-position, .editable-salary");

    if (event.key === "Enter" && container) {
      event.preventDefault();
      target.blur();
    }
  });

  tableEmployees.addEventListener("focusout", (event) => {
    const target = event.target;
    const container = target.closest(".editable-position, .editable-salary");

    if (container) {
      event.preventDefault();

      const { field: property, idEmployee } = container.dataset;
      const value = target.value;
      const date = getDate();

      store.editProperty(idEmployee, property, value, date);

      container.classList.remove("open");
      updateUI();
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
  const showModalVacations = document.getElementById("modal-overlay-vacations");

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
  const btnCloseVacationsModal =
    showModalVacations.querySelector(".btn-close-modal");

  btnCloseModal.addEventListener("click", closeAssignModal);
  btnCloseShowAssignModal.addEventListener("click", closeShowAssignModal);
  btnCloseShowEmpModal.addEventListener("click", closeShowEmpModal);
  btnCloseEdutModal.addEventListener("click", closeModalEditAssign);
  btnCloseUnAssignModal.addEventListener("click", closeModalUnAssign);
  btnCloseSeedDataModal.addEventListener("click", closeModalSeedData);
  btnCloseVacationsModal.addEventListener("click", closeModalVacations);

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
    if (event.target === showModalVacations) {
      closeModalVacations();
    }
  });

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
    updateUI();
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
      updateUI();
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

    updateUI();
    closeAssignModal();
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
        `${getCurrentProjectCapasity(idProject).toFixed(2)} / 4`;

      const error = document.querySelector(".error-over-capacity");
      error.classList.toggle(
        "visible",
        +InputCapasity.value > data.availableForSelectionCapacity,
      );
      btnAssign.disabled =
        +InputCapasity.value > data.availableForSelectionCapacity;
    }
  });

  InputCapasity.addEventListener("input", () => {
    const idProject = selectProject.value;
    const idEmployee = assignModalOverlay.dataset.idEmployee;
    const employee = store.data[getDate()].employees.find(
      (item) => item.id === idEmployee,
    );

    const data = calculationOfCapacity(employee, idProject);

    let targetCapacity;
    if (employee.assignments.find((item) => item.idProject === idProject)) {
      const targetAssign = employee.assignments.find(
        (item) => item.idProject === idProject,
      );
      targetCapacity =
        getCurrentProjectCapasity(idProject) -
        calculateEffectiveСapacity(
          targetAssign.capacity,
          targetAssign.fit,
          employee,
        ) +
        calculateEffectiveСapacity(
          InputCapasity.value,
          InputFit.value,
          employee,
        );
    } else {
      targetCapacity =
        getCurrentProjectCapasity(idProject) +
        calculateEffectiveСapacity(
          InputCapasity.value,
          InputFit.value,
          employee,
        );
    }
    document.querySelector(".target-capacity").textContent =
      `${targetCapacity.toFixed(2)} / 4`;

    const error = document.querySelector(".error-over-capacity");
    error.classList.toggle(
      "visible",
      +InputCapasity.value > data.availableForSelectionCapacity,
    );
    btnAssign.disabled =
      +InputCapasity.value > data.availableForSelectionCapacity ||
      InputCapasity.value <= 0 ||
      +InputFit.value <= 0;

    document.querySelector(".capasity-input-span").textContent =
      `${InputCapasity.value}`;
    document.querySelector(".effective-capacity").textContent =
      `${calculateEffectiveСapacity(InputCapasity.value, InputFit.value, employee).toFixed(2)}`;
  });

  InputFit.addEventListener("input", () => {
    const idProject = selectProject.value;
    const idEmployee = assignModalOverlay.dataset.idEmployee;

    const employee = store.data[getDate()].employees.find(
      (item) => item.id === idEmployee,
    );

    let targetCapacity;
    if (employee.assignments.find((item) => item.idProject === idProject)) {
      const targetAssign = employee.assignments.find(
        (item) => item.idProject === idProject,
      );
      targetCapacity =
        getCurrentProjectCapasity(idProject) -
        calculateEffectiveСapacity(
          targetAssign.capacity,
          targetAssign.fit,
          employee,
        ) +
        calculateEffectiveСapacity(
          InputCapasity.value,
          InputFit.value,
          employee,
        );
    } else {
      targetCapacity =
        getCurrentProjectCapasity(idProject) +
        calculateEffectiveСapacity(
          InputCapasity.value,
          InputFit.value,
          employee,
        );
    }

    document.querySelector(".target-capacity").textContent =
      `${targetCapacity.toFixed(2)} / 4`;
    document.querySelector(".fit-input-span").textContent = `${InputFit.value}`;
    document.querySelector(".effective-capacity").textContent =
      `${calculateEffectiveСapacity(InputCapasity.value, InputFit.value, employee).toFixed(2)}`;
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
    } else {
      showEditModalOverlay.querySelector(".error-too-capacity").style.display =
        "none";
    }

    btnSaveEdit.disabled =
      +inputCapacityEdit.value > data.availableForSelectionCapacity ||
      inputCapacityEdit.value <= 0 ||
      +inputFitEdit.value <= 0;
  });

  inputFitEdit.addEventListener("input", () => {
    showEditModalOverlay.querySelector(".fit-input-span").textContent =
      `${inputFitEdit.value}`;

    btnSaveEdit.disabled = +inputFitEdit.value <= 0;
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
    updateUI();
    closeModalEditAssign();
  });

  const btnSeedData = document.querySelector(".btn-seed-data");

  btnSeedData.addEventListener("click", () => {
    openModalSeedData();
  });

  // Grid Calendar

  const gridCalendar = document.querySelector(".grid-calendar");

  gridCalendar.addEventListener("click", (event) => {
    if (event.target.closest(".availability")) {
      event.target.classList.toggle("selected");
      const selectedDays = Array.from(
        document.querySelectorAll(".selected"),
      ).map((cell) => (cell = cell.dataset.day));

      const workingDays = getWorkingDays();
      const vacationWorkingDays = selectedDays.length;

      document.querySelector(".count-working-day-span").textContent =
        `${workingDays - vacationWorkingDays} / ${workingDays}`;

      document.querySelector(".vacations-txt-span").textContent =
        `${formatVacationsDays(selectedDays, getDate().slice(5))}`;
    }
  });

  const btnSetVacations = document.querySelector(".btn-set-vacations");

  btnSetVacations.addEventListener("click", () => {
    const selectedCell = Array.from(document.querySelectorAll(".selected"));
    const days = selectedCell.map((cell) => (cell = cell.dataset.day));
    const idEmployee = showModalVacations.dataset.idEmployee;
    const date = getDate();
    store.addVacations(date, idEmployee, days);

    updateUI();
    closeModalVacations();
  });

  const projectsTableHeader = document.querySelector(".thead-projects");
  const employeesTableHeader = document.querySelector(".thead-employees");

  // Coртировка
  let projectsSortState = {
    column: null,
    direction: "asc",
  };

  projectsTableHeader.addEventListener("click", (e) => {
    const target = e.target.closest(".sortable");

    if (!target) return;
    const column = target.dataset.sort;
    if (projectsSortState.column === column) {
      projectsSortState.direction =
        projectsSortState.direction === "asc" ? "desc" : "asc";
    } else {
      projectsSortState.column = column;
      projectsSortState.direction = "asc";
    }

    projectsTableHeader.querySelectorAll("[data-sort]").forEach((el) => {
      el.classList.remove("asc", "desc");
    });

    target.classList.add(
      projectsSortState.direction === "asc" ? "asc" : "desc",
    );

    const monthData = getMonthData();
    const projects = [...monthData.projects];

    projects.sort((a, b) => {
      let result = 0;

      if (column === "budget") {
        result = a[column] - b[column];
      } else if (column === "estimatedIncome") {
        const currentDate = getDate();
        const statsA = calculateBudgetProject(a, currentDate);
        const statsB = calculateBudgetProject(b, currentDate);
        result = statsA.projectIncome - statsB.projectIncome;
      } else {
        result = (a[column] ?? "").localeCompare(b[column] ?? "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return projectsSortState.direction === "asc" ? result : -result;
    });

    updateUIProjects(projects);
  });

  let employeesSortState = {
    column: null,
    direction: "asc",
  };

  const gradeOrder = {
    Junior: 1,
    Middle: 2,
    Senior: 3,
    Lead: 4,
    Architect: 5,
    BO: 6,
  };

  employeesTableHeader.addEventListener("click", (e) => {
    const target = e.target.closest(".sortable");

    if (!target) return;
    const column = target.dataset.sort;

    if (employeesSortState.column === column) {
      employeesSortState.direction =
        employeesSortState.direction === "asc" ? "desc" : "asc";
    } else {
      employeesSortState.column = column;
      employeesSortState.direction = "asc";
    }

    employeesTableHeader.querySelectorAll("[data-sort]").forEach((el) => {
      el.classList.remove("asc", "desc");
    });

    target.classList.add(
      employeesSortState.direction === "asc" ? "asc" : "desc",
    );

    const monthData = getMonthData();
    const employees = [...monthData.employees];
    employees.sort((a, b) => {
      let result = 0;

      if (column === "name" || column === "surname") {
        result = (a[column] ?? "").localeCompare(b[column] ?? "", undefined, {
          numeric: true,
          sensitivity: "base",
        });
      } else if (column === "position") {
        result = gradeOrder[a[column]] - gradeOrder[b[column]];
      } else if (column === "estimatedPayment") {
        const statsA = calculateBudgetEmployee(a);
        const statsB = calculateBudgetEmployee(b);
        result = statsA.estimatedPayment - statsB.estimatedPayment;
      } else if (column === "projectIncome") {
        const statsA = calculateBudgetEmployee(a);
        const statsB = calculateBudgetEmployee(b);
        result = statsA.projectedIncome - statsB.projectedIncome;
      } else {
        result = a[column] - b[column];
      }

      return employeesSortState.direction === "asc" ? result : -result;
    });

    updateUIEmployees(employees);
  });

  // =================

  updateUI();
}
