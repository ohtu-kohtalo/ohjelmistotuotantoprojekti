import unittest
from backend.services.get_data import GetData

class TestGetData(unittest.TestCase):
    """Tests for the class GetData and its rescale_to_likert method."""

    def setUp(self):
        """Set up sample agent data for testing."""
        self.agent_data = {
            "Age": "25",
            "Gender": "Male",
            "Variable1": -2.0,
            "Variable2": 0.0,
            "Variable3": 2.0
        }
        self.latent_variables = ["Variable1", "Variable2", "Variable3"]

    def test_rescale_to_likert_with_valid_data(self):
        """Test rescaling works correctly on valid input."""
        rescaled_data = GetData.rescale_to_likert(self.agent_data, self.latent_variables)

        # Age and Gender should remain untouched
        self.assertEqual(rescaled_data["Age"], "25")
        self.assertEqual(rescaled_data["Gender"], "Male")

        # All latent variables should be within the Likert scale range 1-5
        for var in self.latent_variables:
            self.assertIn(rescaled_data[var], [1, 2, 3, 4, 5])

    def test_rescale_to_likert_correct_scaling(self):
        """Test rescaling logic on simple known data."""
        agent_data = {
            "Age": "30",
            "Gender": "Female",
            "Variable1": -2.0,
            "Variable2": 0.0,
            "Variable3": 2.0
        }
        latent_variables = ["Variable1", "Variable2", "Variable3"]

        rescaled_data = GetData.rescale_to_likert(agent_data, latent_variables)

        # Check the rescaled values match expectations
        self.assertEqual(rescaled_data["Variable1"], 1)  # Lowest value maps to 1
        self.assertEqual(rescaled_data["Variable3"], 5)  # Highest value maps to 5
        self.assertEqual(rescaled_data["Variable2"], 3)  # Mid value maps to middle of scale

    def test_rescale_to_likert_with_negative_values(self):
        """Test rescaling works when values are negative."""
        agent_data = {
            "Age": "27",
            "Gender": "Male",
            "Variable1": -5.0,
            "Variable2": -3.0,
            "Variable3": -1.0
        }
        latent_variables = ["Variable1", "Variable2", "Variable3"]

        rescaled_data = GetData.rescale_to_likert(agent_data, latent_variables)

        self.assertEqual(rescaled_data["Variable1"], 1)  # Min should map to 1
        self.assertEqual(rescaled_data["Variable3"], 5)  # Max should map to 5

    def test_rescale_to_likert_preserves_non_latent_fields(self):
        """Ensure non-latent fields like Age and Gender are not accidentally modified."""
        rescaled_data = GetData.rescale_to_likert(self.agent_data, self.latent_variables)

        self.assertEqual(rescaled_data["Age"], "25")
        self.assertEqual(rescaled_data["Gender"], "Male")
