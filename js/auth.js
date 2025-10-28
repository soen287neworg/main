document.querySelector(".sign-in").addEventListener("click", function () {
      const savedUser = localStorage.getItem("user");
      const userData = JSON.parse(savedUser);
      const email = document.querySelector("#floatingInput").value;
      const password = document.querySelector("#floatingPassword").value;

      if (userData.email === email && userData.password === password) {
         window.location.href = "./profile.html";
         alert("Login successful!");
        localStorage.setItem("loggedIn", "true");
      } 
      else if (userData.email !== email && userData.password !== password) {
        alert("No account found. Please sign up first.");
        return;
      }
      else {
        alert("Invalid credentials.");
      }
 
    });
  



    