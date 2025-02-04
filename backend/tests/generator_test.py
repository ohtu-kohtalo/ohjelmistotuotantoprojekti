import unittest
from unittest.mock import MagicMock, patch
import pandas as pd
from backend.generator import Generator


class TestGenerator(unittest.TestCase):
    def setUp(self):
        self.mock_gemini = MagicMock()
        self.mock_gemini.get_response.side_effect = lambda x: x
        self.generator = Generator(self.mock_gemini)

    def test_create_prompt(self):
        """Test creating a prompt without giving a website"""
        prompt = self.create_prompt()
        should_be = (
            "Simulate 2 customer profiles for a company. The name "
            "of the company is Mokia and its industry is Telecommunications. "
            "Here are the customer demographics:\n"
            "Marjatta 80 v. Not interested in technology.\n"
            "Veeti 16 v. Addicted to TikTok."
        )
        self.assertEqual(prompt, should_be)

    def test_create_prompt_with_web_site(self):
        """Test creating a prompt with a website"""
        prompt = self.create_prompt(url="https://Mokia.fi")
        should_be = (
            "Simulate 2 customer profiles for a company. The name "
            "of the company is Mokia and its industry is Telecommunications. "
            "Here are the customer demographics:\n"
            "Marjatta 80 v. Not interested in technology.\n"
            "Veeti 16 v. Addicted to TikTok."
            "\nWebsite data for the company: https://Mokia.fi"
        )
        self.assertEqual(prompt, should_be)

    def create_prompt(self, url=None):
        """Helper function that creates a prompt by calling the _create_prompt method
        in Generator"""
        company = "Mokia"
        industry = "Telecommunications"
        number_of_agents = "2"
        profiles = [
            "Marjatta 80 v. Not interested in technology.",
            "Veeti 16 v. Addicted to TikTok.",
        ]
        prompt = self.generator._create_prompt(
            company, industry, number_of_agents, profiles, url
        )
        return prompt
