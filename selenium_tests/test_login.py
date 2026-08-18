from selenium import webdriver
from selenium.webdriver.common.by import By
import time


def test_login():

    driver = webdriver.Chrome()

    try:

        # Open GlycoGuard AI
        driver.get("http://localhost:5173")

        driver.maximize_window()

        time.sleep(2)

        # Find username field
        username = driver.find_element(By.ID, "username")

        # Find password field
        password = driver.find_element(By.ID, "password")

        # Enter credentials
        username.send_keys("lakshmi1906")
        password.send_keys("123456")

        # Click login
        login_button = driver.find_element(By.ID, "loginButton")
        login_button.click()

        time.sleep(3)

        # Check dashboard
        assert "Dashboard" in driver.page_source

        print("LOGIN TEST: PASSED")

    except Exception as e:

        print("LOGIN TEST: FAILED")
        print(e)

        raise

    finally:

        driver.quit()