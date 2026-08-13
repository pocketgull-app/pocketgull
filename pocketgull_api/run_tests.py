"""
Pocket Gull — Python Test Runner
Runs unit and integration tests under pocketgull_api without external dependencies.
"""

import sys
import os
import asyncio
import importlib.util
import inspect

def run_all_tests():
    api_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(api_dir)
    sys.path.insert(0, api_dir)
    sys.path.insert(0, root_dir)
    
    test_files = [(api_dir, f) for f in os.listdir(api_dir) if f.startswith("test_") and f.endswith(".py")]
    tests_dir = os.path.join(api_dir, "tests")
    if os.path.exists(tests_dir):
        test_files.extend([(tests_dir, f) for f in os.listdir(tests_dir) if f.startswith("test_") and f.endswith(".py")])
    
    total_run = 0
    total_failed = 0
    
    print("=== Running Python Data Bridge Unit Tests ===")
    
    for dir_path, file in test_files:
        module_name = file[:-3]
        file_path = os.path.join(dir_path, file)
        
        # Load module dynamically
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec is None or spec.loader is None:
            continue
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Find all test functions
        test_functions = [
            func for name, func in inspect.getmembers(module, inspect.isfunction)
            if name.startswith("test_")
        ]
        
        print(f"\nFile: {file} ({len(test_functions)} tests found)")
        
        for test_func in test_functions:
            print(f"  Running {test_func.__name__}... ", end="")
            total_run += 1
            try:
                if inspect.iscoroutinefunction(test_func):
                    asyncio.run(test_func())
                else:
                    test_func()
                print("\033[92mPASS\033[0m")
            except AssertionError as e:
                total_failed += 1
                print("\033[91mFAIL (Assertion Error)\033[0m")
                print(f"    Details: {e}")
            except Exception as e:
                total_failed += 1
                print("\033[91mFAIL (Unexpected Exception)\033[0m")
                print(f"    Details: {e}")
                
    print("\n==========================================")
    status_color = "\033[92m" if total_failed == 0 else "\033[91m"
    print(f"Test Run Result: {status_color}{total_run - total_failed}/{total_run} Passed\033[0m")
    print("==========================================")
    
    if total_failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
