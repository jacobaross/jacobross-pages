/* Live local time in the footer. Edit CITY / TIME_ZONE only. */
(function () {
  var CITY = "New York, NY";
  var TIME_ZONE = "America/New_York";
  var el = document.getElementById("clock");
  if (!el) return;
  function render() {
    var t;
    try {
      t = new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE
      }).format(new Date());
    } catch (e) {
      t = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
    }
    el.textContent = t.replace(" AM", "am").replace(" PM", "pm") + " in " + CITY;
  }
  render();
  setInterval(render, 20000);
})();
