# Session State KPI Tracker - Feature Documentation

## Overview
The application now includes a professional KPI (Key Performance Indicator) dashboard that tracks scanning statistics during the current session.

## Features Added

### 1. **Three KPI Cards at the Top**

#### 📊 Total Scans (Purple Gradient)
- Displays the total number of label scans performed in the current session
- Updates automatically after each scan
- Color: Purple/Violet gradient (Professional & Eye-catching)

#### ✅ Compliant Count (Green/Blue Gradient)
- Shows the number of labels that passed all compliance checks
- Increments when all mandatory keywords are found
- Color: Green/Blue gradient (Success indicator)

#### ⚠️ Non-Compliant Count (Red/Yellow Gradient)
- Displays the number of labels that failed compliance checks
- Increments when any mandatory keyword is missing
- Color: Red/Yellow gradient (Warning indicator)

### 2. **Session State Management**

The app uses Streamlit's session state to persist data across reruns:

```python
st.session_state.total_scans = 0
st.session_state.compliant_count = 0
st.session_state.non_compliant_count = 0
```

These variables:
- Initialize to 0 when the app first loads
- Persist throughout the entire session
- Reset only when explicitly requested or when the session ends

### 3. **Automatic Counter Updates**

After each compliance check:
```python
st.session_state.total_scans += 1
if is_compliant:
    st.session_state.compliant_count += 1
else:
    st.session_state.non_compliant_count += 1
```

### 4. **Reset Functionality**

Added in the sidebar:
- **🔄 Reset Statistics** button
- Clears all counters back to 0
- Provides a fresh start for a new batch of scans

### 5. **Compliance Rate Metric**

Displays in the sidebar (only when scans exist):
- Calculates: (Compliant Count / Total Scans) × 100
- Shows percentage of compliant products
- Useful for quality control monitoring

## UI Design

### KPI Card Styling
- **Gradient Backgrounds**: Modern, visually appealing
- **Box Shadow**: Subtle depth for professional look
- **Rounded Corners**: Smooth, modern appearance
- **Large Numbers**: Easy to read at a glance
- **Centered Layout**: Clean and organized
- **Responsive**: Adapts to different screen sizes

### Color Psychology
- **Purple (Total)**: Represents authority and professionalism
- **Green (Compliant)**: Success, approval, go-ahead
- **Red (Non-Compliant)**: Warning, attention needed

## Usage Workflow

1. **App Loads** → KPIs show 0/0/0
2. **Upload Image** → Process label
3. **Compliance Check** → KPIs update automatically
4. **View Results** → See updated statistics at top
5. **Reset (Optional)** → Clear all counters for new session

## Benefits

### For Quality Control Teams
- Track daily/session performance
- Monitor compliance rates in real-time
- Identify patterns in non-compliance

### For Operators
- Visual feedback on productivity
- Clear indication of work completed
- Motivation through visible progress

### For Managers
- Quick overview of session performance
- Data-driven insights at a glance
- Session-level compliance metrics

## Technical Implementation

### HTML/CSS Injection
Uses `st.markdown()` with `unsafe_allow_html=True` to create custom-styled cards:
- Inline CSS for styling
- Gradient backgrounds
- Dynamic content injection
- Responsive design

### Session State Lifecycle
- **Initialization**: On first load
- **Persistence**: Throughout browser session
- **Updates**: After each scan
- **Reset**: Manual or session end

## Example Scenarios

### Scenario 1: Quality Check Session
```
Initial:    0 scans | 0 compliant | 0 non-compliant
After 5:    5 scans | 4 compliant | 1 non-compliant
Rate:       80% compliance
```

### Scenario 2: Perfect Batch
```
Initial:   0 scans | 0 compliant | 0 non-compliant
After 10: 10 scans | 10 compliant | 0 non-compliant
Rate:      100% compliance ✨
```

### Scenario 3: Quality Issues
```
Initial:   0 scans | 0 compliant | 0 non-compliant
After 8:   8 scans | 3 compliant | 5 non-compliant
Rate:      37.5% compliance ⚠️
```

## Future Enhancements (Ideas)

1. **Export Statistics**: Download session report as CSV/Excel
2. **Historical Data**: Save statistics across sessions
3. **Graphs/Charts**: Visual trends over time
4. **Alerts**: Notify when compliance rate drops below threshold
5. **Batch Mode**: Process multiple images and aggregate stats
6. **User Profiles**: Track statistics per user/team

## Troubleshooting

### KPIs Not Updating
- Check if compliance check is completing
- Verify session state initialization
- Look for errors in console

### Statistics Reset Unexpectedly
- Browser tab refreshed (new session)
- Server restarted
- Session timeout

### Incorrect Counts
- Ensure only one compliance check per image
- Check for duplicate processing
- Verify counter increment logic

## Code Locations

- **Initialization**: Lines ~507-513
- **KPI Display**: Lines ~515-565
- **Counter Updates**: Lines ~710-716
- **Reset Button**: Lines ~583-589
- **Compliance Rate**: Lines ~592-594

---

**Note**: This feature enhances user experience and provides valuable insights into scanning operations during a session. The KPI dashboard gives immediate visual feedback and helps track productivity and quality metrics.
