const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const datePicker = document.getElementById("myDate");
const timePicker = document.getElementById("myTime");
const voiceSelect = document.getElementById("Voice");

let tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};
let selectedVoiceIndex = localStorage.getItem("selectedVoiceIndex") || 0;

function addTask() {
  const selectedDate = datePicker.value;
  const selectedTime = timePicker.value;
  const taskText = inputBox.value.trim();

  if (!selectedDate || !selectedTime) {
    alert("Please select both date and time!");
    return;
  }

  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  if (!tasksByDate[selectedDate]) {
    tasksByDate[selectedDate] = [];
  }

  tasksByDate[selectedDate].push({
    time: selectedTime,
    text: taskText,
    completed: false
  });

  inputBox.value = "";
  timePicker.value = "";

  saveData();
  showTask(selectedDate);
}

function saveData() {
  localStorage.setItem("tasksByDate", JSON.stringify(tasksByDate));
}

function showTask(date) {
  listContainer.innerHTML = "";
  if (!tasksByDate[date] || tasksByDate[date].length === 0) return;

  tasksByDate[date].forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = `${convertTo12Hour(task.time)} - ${task.text}`;
    if (task.completed) li.classList.add("checked");

    li.addEventListener("click", () => {
      task.completed = !task.completed;
      saveData();
      showTask(date);
    });

    const span = document.createElement("span");
    span.textContent = "\u00d7";
    span.onclick = (e) => {
      e.stopPropagation();
      deleteTask(date, index);
    };

    li.appendChild(span);
    listContainer.appendChild(li);
  });
}

function deleteTask(date, index) {
  tasksByDate[date].splice(index, 1);
  if (tasksByDate[date].length === 0) delete tasksByDate[date];
  saveData();
  showTask(date);
}

datePicker.addEventListener("change", () => {
  showTask(datePicker.value);
});

let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((voice, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  // Restore previous selected voice
  if (voices.length > 0 && selectedVoiceIndex < voices.length) {
    voiceSelect.selectedIndex = selectedVoiceIndex;
  }
}

speechSynthesis.onvoiceschanged = loadVoices;

voiceSelect.addEventListener("change", () => {
  selectedVoiceIndex = voiceSelect.value;
  localStorage.setItem("selectedVoiceIndex", selectedVoiceIndex);
});

function readTasks() {
  const selectedDate = datePicker.value;
  if (!selectedDate || !tasksByDate[selectedDate] || tasksByDate[selectedDate].length === 0) {
    speak("No tasks today");
    return;
  }

  let text = `Tasks for ${selectedDate}. `;
  tasksByDate[selectedDate].forEach((task) => {
    text += `${convertTo12Hour(task.time)}, ${task.text}`;
    if (task.completed) text += ", completed. ";
    else text += ". ";
  });

  speak(text);
}
const name

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = voiceSelect.value;
  if (voices[selectedVoice]) {
    utterance.voice = voices[selectedVoice];
  }
  speechSynthesis.speak(utterance);
}

// Converts 24-hour to 12-hour time with AM/PM
function convertTo12Hour(timeStr) {
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

// Initial load
window.addEventListener("load", () => {
  loadVoices();
  if (datePicker.value) {
    showTask(datePicker.value);
  }
});
