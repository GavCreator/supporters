document.addEventListener("DOMContentLoaded", function () {
  const vis = document.getElementById("vispass");
  const pass = document.getElementsByName("pass")[0];

  vis.addEventListener("mouseenter", function () {
    pass.setAttribute("type", "text");
  });

  vis.addEventListener("mouseleave", function () {
    pass.setAttribute("type", "password");
  });
});
