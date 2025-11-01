function showTab(tabId) {
  document.getElementById('train').style.display = 'none';
  document.getElementById('generate').style.display = 'none';
  document.getElementById('manage').style.display = 'none';
  document.getElementById('save').style.display = 'none';
  document.getElementById(tabId).style.display = 'block';
}
