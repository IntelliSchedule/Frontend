document.addEventListener("DOMContentLoaded", () => {
  const expandButton = document.getElementById("expandButton");
  const container = document.getElementById("container");

  expandButton.addEventListener("click", () => {
    container.classList.toggle("expanded");
  });
});
