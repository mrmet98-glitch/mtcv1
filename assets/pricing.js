(() => {
  const billingButtons = document.querySelectorAll("[data-billing]");
  const priceValues = document.querySelectorAll(".price strong[data-monthly]");
  const billingCopies = document.querySelectorAll(".price-billing[data-monthly-copy]");
  const selector = document.getElementById("volumeSelector");
  const cards = document.querySelectorAll(".price-card[data-tier]");

  const setBilling = (mode) => {
    billingButtons.forEach((button) => button.classList.toggle("active", button.dataset.billing === mode));
    priceValues.forEach((value) => { value.textContent = value.dataset[mode]; });
    billingCopies.forEach((copy) => { copy.textContent = copy.dataset[`${mode}Copy`]; });
  };

  billingButtons.forEach((button) => button.addEventListener("click", () => setBilling(button.dataset.billing)));

  const highlightTier = (tier) => {
    cards.forEach((card) => card.classList.toggle("recommended", card.dataset.tier === tier));
  };

  selector?.addEventListener("change", () => highlightTier(selector.value));
})();
