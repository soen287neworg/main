document.querySelector(".sign-up").addEventListener("click", function () {
      const email = document.querySelector("#floatingInput").value;
      const password = document.querySelector("#floatingPassword").value;

      if (!email || !password) {
        alert("Please fill in all fields.");
        return;
      }

      const user = { email, password };
      localStorage.setItem("user", JSON.stringify(user));
      alert("Account created successfully!");
    });
