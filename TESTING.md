# Testing CommunityCompass

We use `pytest` for running automated tests.

## Prerequisites
Ensure development dependencies are installed:
```bash
pip install -r requirements.txt
```

## Running Tests
Run all tests from the root directory:
```bash
pytest
```

## Project Testing Structure
- **`tests/conftest.py`**: Contains test configuration and fixtures. Crucially, it overrides the `storage` module to use an **in-memory dictionary** instead of `db.json`, ensuring tests don't mess up your real data.
- **`tests/test_users.py`**: Tests user creation, retrieval, and validation.
- **`tests/test_groups.py`**: Tests group creation, joining, leaving, and the "looking for members" filter.

## How to add new tests
1. Create a file named `test_<feature>.py` in the `tests/` folder.
2. Define functions starting with `test_`.
3. Use the `client` fixture to make API requests.
