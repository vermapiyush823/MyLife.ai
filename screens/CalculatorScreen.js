import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { evaluate } from 'mathjs';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

// Reusable Calculator Button Component
const CalculatorButton = ({ title, onPress, style, textStyle, isWide = false, isOperator = false }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`h-20 ${isWide ? 'flex-2' : 'flex-1'} rounded-full items-center justify-center mx-1 ${style}`}
    activeOpacity={0.6}
  >
    <Text className={`${isOperator ? 'text-3xl' : 'text-2xl'} font-light ${textStyle}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

const CalculatorScreen = ({ navigation }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Load calculations from Firestore
  useEffect(() => {
    if (!user) return;

    const calculationsRef = collection(db, 'calculations');
    const q = query(
      calculationsRef,
      where('userId', '==', user.uid)
      // Note: Removed orderBy to avoid composite index requirement
      // Will sort in JavaScript instead
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calculationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toLocaleTimeString() || 'Unknown',
        rawTimestamp: doc.data().timestamp?.toDate?.() || new Date(0)
      }));
      
      // Sort by timestamp in JavaScript (most recent first)
      calculationsList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      
      setHistory(calculationsList);
    });

    return () => unsubscribe();
  }, [user]);

  // Save calculation to Firestore
  const saveCalculationToFirestore = async (expression, result) => {
    if (!user) return;

    try {
      setLoading(true);
      await addDoc(collection(db, 'calculations'), {
        userId: user.uid,
        expression,
        result,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely evaluate mathematical expressions
  const evaluateExpression = (expr) => {
    try {
      // Replace display symbols with mathjs compatible ones
      let processedExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/e/g, 'e')
        .replace(/√/g, 'sqrt')
        .replace(/\^/g, '**')
        .replace(/log/g, 'log10')
        .replace(/ln/g, 'log');

      const result = evaluate(processedExpr);
      return isFinite(result) ? result : 'Error';
    } catch (error) {
      return 'Syntax Error';
    }
  };

  const handleInput = (value) => {
    if (display === '0' || display === 'Error' || display === 'Syntax Error') {
      setDisplay(value);
      setExpression(value);
    } else {
      setDisplay(display + value);
      setExpression(expression + value);
    }
  };

  const handleOperation = (op) => {
    if (display === 'Error' || display === 'Syntax Error') return;
    
    const lastChar = display.slice(-1);
    const operators = ['+', '-', '×', '÷', '^'];
    
    if (operators.includes(lastChar)) {
      // Replace the last operator
      setDisplay(display.slice(0, -1) + op);
      setExpression(expression.slice(0, -1) + op);
    } else {
      setDisplay(display + op);
      setExpression(expression + op);
    }
  };

  const handleFunction = (func) => {
    if (display === 'Error' || display === 'Syntax Error') {
      setDisplay(func + '(');
      setExpression(func + '(');
    } else {
      setDisplay(display + func + '(');
      setExpression(expression + func + '(');
    }
  };

  const handleConstant = (constant) => {
    if (display === '0' || display === 'Error' || display === 'Syntax Error') {
      setDisplay(constant);
      setExpression(constant);
    } else {
      setDisplay(display + constant);
      setExpression(expression + constant);
    }
  };

  const handleEquals = async () => {
    if (expression === '' || display === 'Error' || display === 'Syntax Error') return;
    
    const result = evaluateExpression(expression);
    const resultStr = typeof result === 'number' ? 
      (result % 1 === 0 ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '')) : 
      result.toString();
    
    // Only save to Firestore if calculation was successful
    if (resultStr !== 'Error' && resultStr !== 'Syntax Error') {
      await saveCalculationToFirestore(display, resultStr);
    }
    
    setDisplay(resultStr);
    setExpression(resultStr);
  };

  const handleClearHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Delete all calculations for the current user
      const calculationsRef = collection(db, 'calculations');
      const q = query(calculationsRef, where('userId', '==', user.uid));
      
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemPress = (item) => {
    setDisplay(item.result);
    setExpression(item.result);
    setShowHistory(false);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression('');
    }
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Error' || display === 'Syntax Error') return;
    
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
      setExpression(expression.slice(1));
    } else {
      setDisplay('-' + display);
      setExpression('-' + expression);
    }
  };

  const handleSquare = () => {
    if (display === 'Error' || display === 'Syntax Error') return;
    setDisplay(display + '²');
    setExpression(expression + '^2');
  };

  const formatDisplay = (value) => {
    if (value.length > 12) {
      const num = parseFloat(value);
      if (isFinite(num)) {
        return num.toExponential(5);
      }
    }
    return value;
  };

  const renderBasicButtons = () => (
    <View className="px-6">
      {/* Row 1 */}
      <View className="flex-row mb-3">
        <CalculatorButton
          title="AC"
          onPress={handleClear}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="⌫"
          onPress={handleBackspace}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="%"
          onPress={() => handleOperation('%')}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="÷"
          onPress={() => handleOperation('÷')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 2 */}
      <View className="flex-row mb-3">
        <CalculatorButton
          title="7"
          onPress={() => handleInput('7')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="8"
          onPress={() => handleInput('8')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="9"
          onPress={() => handleInput('9')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="×"
          onPress={() => handleOperation('×')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 3 */}
      <View className="flex-row mb-3">
        <CalculatorButton
          title="4"
          onPress={() => handleInput('4')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="5"
          onPress={() => handleInput('5')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="6"
          onPress={() => handleInput('6')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="−"
          onPress={() => handleOperation('-')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 4 */}
      <View className="flex-row mb-3">
        <CalculatorButton
          title="1"
          onPress={() => handleInput('1')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="2"
          onPress={() => handleInput('2')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="3"
          onPress={() => handleInput('3')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="+"
          onPress={() => handleOperation('+')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 5 */}
      <View className="flex-row">
        <CalculatorButton
          title="0"
          onPress={() => handleInput('0')}
          style="bg-surface"
          textStyle="text-textPrimary"
          isWide={true}
        />
        <CalculatorButton
          title="."
          onPress={() => handleInput('.')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title={loading ? "..." : "="}
          onPress={handleEquals}
          style={`${loading ? 'bg-gray-500' : 'bg-success'}`}
          textStyle="text-white"
          isOperator={true}
        />
      </View>
    </View>
  );

  const renderHistoryView = () => (
    <View className="flex-1 px-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-textPrimary">
          Calculation History
        </Text>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            className={`px-3 py-2 rounded-lg ${loading ? 'bg-gray-500' : 'bg-red-500'}`}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text className="text-white text-sm font-medium">
              {loading ? 'Clearing...' : 'Clear All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!user ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-textSecondary text-lg text-center">
            Please log in to save calculations
          </Text>
          <Text className="text-textSecondary text-sm text-center mt-2">
            Your calculations will be saved to the cloud
          </Text>
        </View>
      ) : history.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-textSecondary text-lg text-center">
            No calculations yet
          </Text>
          <Text className="text-textSecondary text-sm text-center mt-2">
            Perform some calculations to see history here
          </Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {history.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleHistoryItemPress(item)}
              className="bg-surface p-4 rounded-xl mb-3 border border-gray-700"
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-textSecondary text-sm mb-1">
                    {item.timestamp}
                  </Text>
                  <Text className="text-textPrimary text-base mb-2">
                    {item.expression}
                  </Text>
                  <Text className="text-primary text-xl font-semibold">
                    = {item.result}
                  </Text>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded-lg">
                  <Text className="text-primary text-xs">Tap to use</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderScientificButtons = () => (
    <View className="px-4">
      {/* Row 1 */}
      <View className="flex-row mb-2">
        <CalculatorButton
          title="AC"
          onPress={handleClear}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="("
          onPress={() => handleInput('(')}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title=")"
          onPress={() => handleInput(')')}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="⌫"
          onPress={handleBackspace}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="÷"
          onPress={() => handleOperation('÷')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 2 */}
      <View className="flex-row mb-2">
        <CalculatorButton
          title="sin"
          onPress={() => handleFunction('sin')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="cos"
          onPress={() => handleFunction('cos')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="tan"
          onPress={() => handleFunction('tan')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="log"
          onPress={() => handleFunction('log')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="×"
          onPress={() => handleOperation('×')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 3 */}
      <View className="flex-row mb-2">
        <CalculatorButton
          title="ln"
          onPress={() => handleFunction('ln')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="√"
          onPress={() => handleFunction('√')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="x²"
          onPress={handleSquare}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="^"
          onPress={() => handleOperation('^')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="−"
          onPress={() => handleOperation('-')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 4 */}
      <View className="flex-row mb-2">
        <CalculatorButton
          title="π"
          onPress={() => handleConstant('π')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="e"
          onPress={() => handleConstant('e')}
          style="bg-secondary"
          textStyle="text-white"
        />
        <CalculatorButton
          title="7"
          onPress={() => handleInput('7')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="8"
          onPress={() => handleInput('8')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="+"
          onPress={() => handleOperation('+')}
          style="bg-primary"
          textStyle="text-white"
          isOperator={true}
        />
      </View>

      {/* Row 5 */}
      <View className="flex-row mb-2">
        <CalculatorButton
          title="%"
          onPress={() => handleOperation('%')}
          style="bg-surface"
          textStyle="text-textSecondary"
        />
        <CalculatorButton
          title="9"
          onPress={() => handleInput('9')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="4"
          onPress={() => handleInput('4')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="5"
          onPress={() => handleInput('5')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="6"
          onPress={() => handleInput('6')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
      </View>

      {/* Row 6 */}
      <View className="flex-row mb-2">
        <CalculatorButton
          title="."
          onPress={() => handleInput('.')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="1"
          onPress={() => handleInput('1')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="2"
          onPress={() => handleInput('2')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="3"
          onPress={() => handleInput('3')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
        <CalculatorButton
          title="0"
          onPress={() => handleInput('0')}
          style="bg-surface"
          textStyle="text-textPrimary"
        />
      </View>

      {/* Equals button - full width */}
      <View className="flex-row">
        <CalculatorButton
          title={loading ? "..." : "="}
          onPress={handleEquals}
          style={`${loading ? 'bg-gray-500' : 'bg-success'}`}
          textStyle="text-white"
          isOperator={true}
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1119" />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-background">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-semibold text-textPrimary">
              {showHistory ? 'History' : 'Calculator'}
            </Text>
            <Text className="text-textSecondary mt-1">
              {showHistory 
                ? user 
                  ? `${history.length} calculation${history.length !== 1 ? 's' : ''}`
                  : 'Login to save calculations'
                : (isScientific ? 'Scientific mode' : 'Basic mode')
              }
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowHistory(!showHistory)}
              className="bg-secondary px-4 py-2 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-medium">
                {showHistory ? 'Calculator' : 'History'}
              </Text>
            </TouchableOpacity>
            {!showHistory && (
              <TouchableOpacity
                onPress={() => setIsScientific(!isScientific)}
                className="bg-primary px-4 py-2 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-white text-sm font-medium">
                  {isScientific ? 'Basic' : 'Scientific'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      {showHistory ? (
        renderHistoryView()
      ) : (
        <>
          {/* Result Display */}
          <View className="flex-1 justify-end px-6 pb-4">
            <View className="mb-6">
              {expression && expression !== display && (
                <Text className="text-textSecondary text-lg text-right mb-2">
                  {expression}
                </Text>
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="text-textPrimary text-5xl font-light text-right min-w-full">
                  {formatDisplay(display)}
                </Text>
              </ScrollView>
            </View>
          </View>

          {/* Button Grid */}
          <View className="pb-6">
            {isScientific ? renderScientificButtons() : renderBasicButtons()}
          </View>
        </>
      )}
    </View>
  );
};

export default CalculatorScreen;
