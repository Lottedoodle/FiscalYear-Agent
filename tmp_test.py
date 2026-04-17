strs = ["flower", "flow", "flight"]

prefix = strs[0]

try:
    for i in range(1, len(strs)):
        for j in range(0, len(strs[i])):
            if i+1 <= len(strs):
                # โค้ดที่ผู้ใช้เขียนมี SyntaxError ตรงนี้เพราะไม่มีคำสั่งใต้ if
                pass 
                if strs[i+1][j] == strs[i][j] and prefix[j] == strs[i][j]:
                    pass
            else:
                pass
except Exception as e:
    print(f"Error occurred: {type(e).__name__} - {e}")
